import * as bodyParser from "body-parser";
import * as c from "./src/context";
import * as Tokens from "csrf";
import * as express from "express";
import * as handlebars from "express-handlebars";
import * as session from "express-session";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as shortid from "shortid";
import * as request_funcs from "./src/request_funcs";
import * as db_impl from "./src/db";
import * as password_checker from "./src/password";
import * as pg from "./src/db-pg";


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

let make_context_wrap = ( logger, conf, db ) => (callback) => {
    return function (req, res) {
        let request_logger = make_logger( logger );
        request_logger.info( "Begin request to", req.method, req.path );

        let checker = new password_checker.Checker(
            conf['preferred_password_crypt_method']
            ,db
        );

        let context = new c.Context( conf, request_logger, checker );

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
        }

        request_logger.info( "Finished request to", req.method, req.path );
        return ret;
    }
};


function error_handler_builder( logger ) {
    return ( err, req, res, next ) => {
        logger.error( err.toString() );
        logger.error( "Stack trace: ", err.stack );

        if( res.headersSent ) return next( err );
        res.status( 500 );
    };
};

function init_server( conf, db, logger )
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
    server.use( bodyParser.json() );
    server.use( bodyParser.urlencoded({ extended: true }) );
    server.use( express.static( 'public' ) );
    server.use( session( session_options ) );

    server.engine( 'handlebars', handlebars({
        defaultLayout: 'main'
    }) );
    server.set( 'view engine', 'handlebars' );

    server.set( "trust proxy", conf.is_behind_reverse_proxy );

    // Init context
    logger.setLevel( conf.log_level );
    logger.format = ( level, date, message ) => message;
    server.use( error_handler_builder( logger ) );

    request_funcs.set_db( db );


    let context_wrap = make_context_wrap( logger, conf, db );
    // Add server routing callbacks
    server.get('/api/', context_wrap( request_funcs.get_versions ) );
    server.put( '/api/v1/member',
            context_wrap( request_funcs.put_member ) );
    server.get( '/api/v1/member/:member_id',
        context_wrap( request_funcs.get_member ) );
    server.put( '/api/v1/member/:member_id/address',
        context_wrap( request_funcs.put_member_address ) );
    server.get( '/api/v1/member/:member_id/address',
        context_wrap( request_funcs.get_member_address ) );
    server.put( '/api/v1/member/:member_id/is_active',
        context_wrap( request_funcs.put_member_is_active ) );
    server.get( '/api/v1/member/:member_id/is_active',
        context_wrap( request_funcs.get_member_is_active ) );
    server.put( '/api/v1/member/:member_id/rfid',
        context_wrap( request_funcs.put_member_rfid ) );
    server.get( '/api/v1/rfid/:rfid',
        context_wrap( request_funcs.get_member_rfid ) );
    server.post( '/user/login',
        context_wrap( request_funcs.login_user ) );
    server.post( '/user/logout',
        context_wrap( request_funcs.logout_user ) );
    server.get( '/user/is-logged-in',
        context_wrap( request_funcs.is_user_logged_in ) );
    server.get( '/', context_wrap( request_funcs.tmpl_view( 'home' ) ) );

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
    return server;
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
    let conf = yaml.safeLoad(
        fs.readFileSync( 'config.yaml', 'utf8' ),
        {
            filename: "config.yaml"
        }
    );

    return conf;
}


let httpServer;
export let SERVER;
let logger;

export function start(
    db?: db_impl.DB
    ,conf?: Object
): void
{
    if(! conf) conf = default_conf();
    if(! db) db = default_db( conf );
    logger = require( 'logger' ).createLogger( conf["log_file"] );

    // Init server
    SERVER = init_server( conf, db, logger );
    httpServer = require( 'http' ).createServer( SERVER );

    let port = conf["port"];
    // Start server running
    httpServer.listen( port );
    logger.info( "Server running on port", port );
}

export function stop (): void
{
    logger.info( "Stopped running server" );
    httpServer.close();
}


if( process.argv[2] == "start" ) start();
