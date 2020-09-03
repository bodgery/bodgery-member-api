import * as path from "path";
import * as bodyParser from "body-parser";
import * as c from "./src/context";
import {createConnection} from "typeorm";
import * as Tokens from "csrf";
import * as express from "express";
import * as handlebars from "express-handlebars";
import * as session from "express-session";
import * as fs from "fs";
import * as shortid from "shortid";
import * as request_funcs from "./src/request_funcs";
import * as db_impl from "./src/db";
import config from "./src/config";
import * as password_checker from "./src/password";
import * as pg from "./src/db-pg";
import * as wa_api from "./src/wild_apricot";
import * as yargs from "yargs";
import * as http from "http";


let make_logger = (logger) => {
    let request_id = shortid.generate();
    let log_func = function (level, args) {
        let date = new Date();
        args.unshift( "(" + request_id + ")" );
        args.unshift( "[" + date.toISOString() + "]" );
        return logger[level]( ...args );
    };

    let request_logger = {
        fatal: function(...args) { log_func( "fatal", args ) }
        ,error: function(...args) { log_func( "error", args ) }
        ,warn: function(...args) { log_func( "warn", args ) }
        ,info: function(...args) { log_func( "info", args ) }
        ,debug: function(...args) { log_func( "debug", args ) }
    };

    return request_logger;
};

function context_middleware( logger, conf, db, wa )
{
    return function(req, res, next) {
        const request_logger = make_logger( logger );
        request_logger.info( "Begin request to", req.method, req.path );

        const checker = new password_checker.Checker(
            conf['preferred_password_crypt_method']
            ,db
        );

        req.ctx = new c.Context( conf, request_logger, checker, wa );

        if(! req.session.csrf_secret ) {
            const tokens = new Tokens();
            request_logger.info( "Making CSRF secret for new client" );
            req.session.csrf_secret = tokens.secretSync();
        }

        try {
            next()
        }
        catch(err) {
            request_logger.error( "Error running request: ",
                err.toString() );
            request_logger.error( "Stack trace: ", err.stack );

            res.sendStatus( 500 );
        }

        request_logger.info( "Finished setting up", req.method, req.path );
    }
}

let make_context_wrap = (
    logger
    ,conf
    ,db
    ,wa
) => (callback) => {
    return function (req, res) {
        let request_logger = make_logger( logger );
        request_logger.info( "Begin request to", req.method, req.path );

        let checker = new password_checker.Checker(
            conf['preferred_password_crypt_method']
            ,db
        );

        let context = new c.Context( conf, request_logger, checker, wa );

        if(! req.session.csrf_secret ) {
            let tokens = new Tokens();
            request_logger.info( "Making CSRF secret for new client" );
            req.session.csrf_secret = tokens.secretSync();
        }

        let ret;
        try {
            ret = callback( req, res, context );
        }
        catch(err) {
            request_logger.error( "Error running request: ",
                err.toString() );
            request_logger.error( "Stack trace: ", err.stack );

            res.sendStatus( 500 );
        }

        request_logger.info( "Finished setting up", req.method, req.path );
        return ret;
    }
};

let typeorm;


function error_handler_builder( logger ) {
    return ( err, req, res, next ) => {
        logger.error( err.toString() );
        logger.error( "Stack trace: ", err.stack );

        if( res.headersSent ) return next( err );
        res.status( 500 );
    };
};

function init_server(
    conf
    ,db
    ,typeorm_connection
    ,logger
    ,wa: wa_api.WA
)
{
    typeorm = typeorm_connection;

    let server = setup_server_params( conf, db, typeorm_connection, logger );
    setup_server_routes( conf, db, logger, server, wa );
    return server;
}

function get_token( req )
{
    let auth_header = req.header( 'Authorization' ) || "";
    let tokens = auth_header.split( ' ' );
    let token = tokens[1];
    return token;
}

function session_authorization( logger )
{
    return (req, res, next ) => {
        const route = req.path;

        const not_allowed = () => {
            logger.error( "User not allowed to access " + route );
            res.sendStatus(401);
        };

        logger.info( "Checking user authorization" );
        // Eventually, we'll have more sophisticated checking for users 
        // accessing individual routes, but for now, any logged in user can 
        // access anything
        if( req.session.is_logged_in ) {
            logger.info( "User is logged in, allowing" );
            next();
        }
        // Tests can set an env var to bypass this check
        // TODO remove
        else if( process.env['TEST_RUN'] ) {
            logger.info( "Server in test run mode, allowing" );
            next();
        }
        // Everything else is not allowed
        else {
            not_allowed();
        }
    };
}

function bearer_authorization( logger, db )
{
    return (req, res, next ) => {
        const route = req.path;
        const token = get_token( req );

        const not_allowed = () => {
            logger.error( "User not allowed to access " + route );
            res.sendStatus(401);
        };

        logger.info( "Checking user authorization" );
        // Bearer tokens
        if( token != undefined ) {
            db.is_token_allowed( token
                ,() => {
                    logger.info( "Bearer token is allowed" );
                    next();
                }
                ,() => {
                    logger.info( "Bearer token is NOT allowed" );
                    not_allowed();
                }
                ,( err: Error ) => {
                    throw err;
                }
            );
        }
        // Tests can set an env var to bypass this check
        // TODO remove
        else if( process.env['TEST_RUN'] ) {
            logger.info( "Server in test run mode, allowing" );
            next();
        }
        // Everything else is not allowed
        else {
            not_allowed();
        }
    };
}

function setup_server_params( conf, db, typeorm_connection, logger )
{
    let use_secure_cookie = (conf['deployment_type'] == "prod");
    let session_options = {
        secret: conf.session_secret
        ,resave: false
        ,saveUninitialized: true
        ,cookie: {
            maxAge: conf.session_length_sec
            ,sameSite: true
            ,secure: use_secure_cookie
            ,httpOnly: true
        }
    };
    let session_store = db.session_store( session );
    if(session_store) session_options['store'] = session_store;

    let server = express();
    server.use( session( session_options ) );
    server.use( bodyParser.json() );
    server.use( bodyParser.raw({
        type: "image/*"
        ,limit: conf['photo_size_limit']
    }) );
    server.use( bodyParser.urlencoded({ extended: true }) );
    server.use( express.static( 'public' ) );

    server.engine( 'handlebars', handlebars({
        defaultLayout: 'main'
    }) );
    server.set( 'view engine', 'handlebars' );

    server.set( "trust proxy", conf.is_behind_reverse_proxy );

    // Init context
    logger.setLevel( conf.log_level );
    logger.format = ( level, date, message ) => message;
    server.use( error_handler_builder( logger ) );

    request_funcs.set_db( db, typeorm_connection );

    return server;
}

function setup_server_routes(
    conf
    ,db
    ,logger
    ,server
    ,wa: wa_api.WA
)
{
    server.use(context_middleware( logger, conf, db, wa ));

    const api = express.Router();

    // API requires bearer token authorization
    api.use(bearer_authorization( logger, db ));

    api.get('/', request_funcs.get_versions );

    const api_v1 = express.Router();
    api_v1.put( '/member',
        request_funcs.put_member );
    api_v1.get( '/member/:member_id',
        request_funcs.get_member );
    api_v1.route( '/member/:member_id/address')
        .put(request_funcs.put_member_address )
        .get(request_funcs.get_member_address );
    api_v1.route( '/member/:member_id/is_active')
        .put(request_funcs.put_member_is_active )
        .get(request_funcs.get_member_is_active );
    api_v1.put( '/member/:member_id/rfid',
        request_funcs.put_member_rfid );
    api_v1.post( '/member/:member_id/send_signup_email',
        request_funcs.post_member_signup_email );
    api_v1.post( '/member/:member_id/send_group_signup_email',
        request_funcs.post_group_member_signup_email );
    api_v1.get( '/members/pending',
        request_funcs.get_members_pending );
    api_v1.put( '/member/:member_id/wildapricot',
        request_funcs.put_member_wildapricot );
    api_v1.put( '/member/:member_id/google_group_signup',
        request_funcs.put_member_google_group );
    api_v1.route( '/member/:member_id/photo')
        .put(request_funcs.put_member_photo )
        .get(request_funcs.get_member_photo );
    api_v1.get( '/rfid/:rfid',
        request_funcs.get_member_rfid );
    api_v1.get( '/rfids',
        request_funcs.get_rfid_dump );
    api_v1.post( '/rfid/log_entry/:rfid/:is_allowed',
        request_funcs.post_log_rfid );

    api.use('/v1', api_v1);

    // Install the API router
    server.use('/api', api);


    // Undocumented route for the callback on Google's OAuth token
    // No longer used
    //server.get( '/api/v1/google_oauth',
    //    request_funcs.google_oauth );

    const views = express.Router();

    const session_required = session_authorization(logger);

    // Unauthenticated routes
    views.get( '/', request_funcs.tmpl_view( 'home' ) );
    views.get( '/user/is-logged-in',
        request_funcs.is_user_logged_in );
    views.post( '/user/login',
        request_funcs.login_user );

    // Authenticated routes
    views.get( '/members/pending', session_required,
        request_funcs.tmpl_view( 'members-pending' ) );
    views.get( '/member/signup', session_required,
        request_funcs.member_signup );
    views.get( '/members/active', session_required,
        request_funcs.members_active );
    views.get( '/member/show/:member_id', session_required,
        request_funcs.member_info );
    views.post( '/user/logout', session_required,
        request_funcs.logout_user );
    views.get( '/rfid/log', session_required,
        request_funcs.rfid_log );
    views.get( '/tokens', session_required,
        request_funcs.tokens );
    views.post( '/tokens/add', session_required,
        request_funcs.add_token );
    views.post( '/tokens/delete', session_required,
        request_funcs.delete_token );

    // Install the View routers
    server.use(views);

    // 404 handler, must be last in the list
    server.use( (req, res, next) => {
        logger.error( "Route {" + req.method + " " + req.path
            + "} not found"  );
        res
            .status( 404 )
            .render( 'not-found', {
                method: req.method
                ,path: req.path
            });
    });
}

function default_db(conf): db_impl.DB
{
    let db: db_impl.DB = new pg.PG(
        conf.db_host
        ,conf.db_port
        ,conf.db_name
        ,conf.db_user
        ,conf.db_password
    );
    return db;
}

export function default_conf(): Object
{
    return config();
}

function default_wa(conf): wa_api.WA
{
    let wa = new wa_api.WildApricot(
        conf['wa_api_client']
        ,conf['wa_api_secret']
        ,conf['wa_account_id']
    );
    return wa;
}

function typeorm_args( conf )
{
    return {
        "name": "default"
        ,"type": "postgres" as 'postgres'
        ,"host": <string> conf.db_host
        ,"port": <number> conf.db_port
        ,"username": <string> conf.db_user
        ,"password": <string> conf.db_password
        ,"database": <string> conf.db_name
        ,"schema": "public"
        ,"synchronize": false
        ,"entities": [
            path.join(__dirname, "src/typeorm/entities/*.{js,ts}")
        ]
        ,...conf.db_ssl && {
            extra: {
                ssl: true
            }
            ,ssl: {
                rejectUnauthorized: false
            }
        }
    };
}


let httpServer;
export let SERVER;
let logger;

export function start(
    db?: db_impl.DB
    ,conf?: Object
    ,wa?: wa_api.WA
): Promise<void>
{
    if(! conf) conf = default_conf();
    if(! db) db = default_db( conf );
    if(! wa) wa = default_wa( conf );
    logger = require( 'logger' ).createLogger( conf["log_file"] );

    // Fix hanging connections for certain external requests. See:
    // https://stackoverflow.com/questions/16965582/node-js-http-get-hangs-after-5-requests-to-remote-site
    http.globalAgent.maxSockets = 1000;

    return new Promise( (resolve, reject) => {
        createConnection( typeorm_args( conf ) )
            .then( (typeorm_connection) => {
                // Init server
                SERVER = init_server( conf, db, typeorm_connection, logger, wa );
                httpServer = require( 'http' ).createServer( SERVER );

                let port = conf["port"];
                // Start server running
                httpServer.listen( port );
                logger.info( "Server running on port", port );

                resolve();
            });
    });
}

export function stop (): Promise<void>
{
    logger.info( "Stopped running server" );

    return new Promise( (resolve, reject) => {
        httpServer.close(() => {
            typeorm
                .close()
                .then( () => {
                    resolve();
                });
        });
    });
}


if( process.argv[2] == "start" ) start();
