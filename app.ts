import * as bodyParser from "body-parser";
import * as c from "./src/context";
import * as Tokens from "csrf";
import * as express from "express";
import * as handlebars from "express-handlebars";
import * as session from "express-session";
import * as fs from "fs";
import * as shortid from "shortid";
import * as request_funcs from "./src/request_funcs";
import * as db_impl from "./src/db";
import config, {Config} from "./src/config";
import * as password_checker from "./src/password";
import * as pg from "./src/db-pg";
import * as wa_api from "./src/wild_apricot";
import * as yargs from "yargs";
import * as http from "http";
import * as logger from "logger";
import {
    authentication_middleware,
    BearerTokenProvider,
    SessionProvider,
    TestUserProvider,
    user_required,
    user_required_or_redirect,
} from './src/auth';
import createConnection, {Connection} from "./src/typeorm_db";

// Need to declare our injected properties on the Request object
declare global {
    namespace Express {
        interface Application {
            logger: logger.Logger;
            db: db_impl.DB;
            orm: Connection;
        }
    }
}

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

        next()
    }
}

function error_handler_builder( logger ) {
    return ( err, req, res, next ) => {
        logger.error( err.toString() );
        logger.error( "Stack trace: ", err.stack );

        if( res.headersSent ) return next( err );
        res.status( 500 );
    };
};

function init_app(
    conf
    ,db
    ,typeorm_connection
    ,logger
    ,wa: wa_api.WA
)
{
    let app = setup_app_params( conf, db, typeorm_connection, logger );
    setup_app_routes( conf, db, logger, app, wa );
    return app;
}

function setup_app_params( conf, db, typeorm_connection, logger )
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

    let app = express();
    app.use( session( session_options ) );
    app.use( bodyParser.json() );
    app.use( bodyParser.raw({
        type: "image/*"
        ,limit: conf['photo_size_limit']
    }) );
    app.use( bodyParser.urlencoded({ extended: true }) );
    app.use( express.static( 'public' ) );

    app.engine( 'handlebars', handlebars({
        defaultLayout: 'main'
    }) );
    app.set( 'view engine', 'handlebars' );

    app.set( "trust proxy", conf.is_behind_reverse_proxy );

    // Init context
    logger.setLevel( conf.log_level );
    logger.format = ( level, date, message ) => message;

    app.use( error_handler_builder( logger ) );

    // // Install the request helpers
    app.logger = logger;
    app.db = db;
    app.orm = typeorm_connection;

    return app;
}

function setup_app_routes(
    conf
    ,db
    ,logger
    ,app
    ,wa: wa_api.WA
)
{
    app.use(context_middleware( logger, conf, db, wa ));

    const api = express.Router();

    // API requires bearer token authorization
    api.use(authentication_middleware([BearerTokenProvider, TestUserProvider]));
    api.use(user_required(logger));

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
    app.use('/api', api);


    // Undocumented route for the callback on Google's OAuth token
    // No longer used
    //app.get( '/api/v1/google_oauth',
    //    request_funcs.google_oauth );

    const views = express.Router();
    views.use(authentication_middleware([SessionProvider, TestUserProvider]));

    // Unauthenticated routes
    views.get( '/', request_funcs.tmpl_view( 'home' ) );
    views.get( '/user/is-logged-in',
        request_funcs.is_user_logged_in );
    views.post( '/user/login',
        request_funcs.login_user );

    // Authenticated routes
    const session_required = user_required_or_redirect(logger, "/");

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
    app.use(views);

    // 404 handler, must be last in the list
    app.use( (req, res, next) => {
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

export function default_conf(): Config
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


export async function createApp(
    typeorm_connection: Connection,
    db?: db_impl.DB
    ,conf?: Config
    ,wa?: wa_api.WA
): Promise<express.Application>
{
    if(! conf) conf = default_conf();
    if(! db) db = default_db( conf );
    if(! wa) wa = default_wa( conf );
    const log = logger.createLogger( conf["log_file"] );

    // Fix hanging connections for certain external requests. See:
    // https://stackoverflow.com/questions/16965582/node-js-http-get-hangs-after-5-requests-to-remote-site
    http.globalAgent.maxSockets = 1000;
    // Init app
    return init_app( conf, db, typeorm_connection, log, wa );
}

export async function start(
    db?: db_impl.DB
    ,conf?: Config
    ,wa?: wa_api.WA
): Promise<http.Server>
{
    if(! conf) conf = default_conf();

    const typeorm_connection = await createConnection( conf );

    const app = await createApp( typeorm_connection, db, conf, wa );

    const httpServer = require( 'http' ).createServer( app );

    let port = conf["port"];
    // Start server running
    httpServer.listen( port );
    app.logger.info( "Server running on port", port );

    return httpServer;
}

if( process.argv[2] == "start" ) start();
