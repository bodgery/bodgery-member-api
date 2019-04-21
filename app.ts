import * as bodyParser from "body-parser";
import * as c from "./src/context";
import * as express from "express";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as shortid from "shortid";
import * as request_funcs from "./src/request_funcs";
import * as db_impl from "./src/db";
import * as pg from "./src/db-pg";


var conf = yaml.safeLoad(
    fs.readFileSync( 'config.yaml', 'utf8' ),
    {
        filename: "config.yaml"
    }
);
var PORT = conf.port;

// Init server
export const SERVER = express();
let httpServer = require( 'http' ).createServer( SERVER );

SERVER.use( bodyParser.json() );
SERVER.use( bodyParser.urlencoded({ extended: true }) );
SERVER.use( express.static( 'public' ) );


// Init context
let logger = require( 'logger' ).createLogger( conf.log_file );
logger.setLevel( conf.log_level );
logger.format = ( level, date, message ) => message;

let make_logger = () => {
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

let context_wrap = (callback) => function (req, res) {
    let request_logger = make_logger();
    request_logger.info( "Begin request to", req.method, req.path );

    let context = new c.Context( conf, request_logger );

    let ret;
    try {
        ret = callback( req, res, context );
    }
    catch(err) {
        request_logger.error( "Error running request: ", err.toString() );
    }

    request_logger.info( "Finished request to", req.method, req.path );
    return ret;
};


// Add server routing callbacks
SERVER.get('/api/', context_wrap( request_funcs.get_versions ) );
SERVER.put( '/api/v1/member', context_wrap( request_funcs.put_member ) );
SERVER.get( '/api/v1/member/:member_id',
    context_wrap( request_funcs.get_member ) );
SERVER.put( '/api/v1/member/:member_id/address',
    context_wrap( request_funcs.put_member_address ) );
SERVER.get( '/api/v1/member/:member_id/address',
    context_wrap( request_funcs.get_member_address ) );
SERVER.put( '/api/v1/member/:member_id/is_active',
    context_wrap( request_funcs.put_member_is_active ) );
SERVER.get( '/api/v1/member/:member_id/is_active',
    context_wrap( request_funcs.get_member_is_active ) );
SERVER.put( '/api/v1/member/:member_id/rfid',
    context_wrap( request_funcs.put_member_rfid ) );
SERVER.get( '/api/v1/rfid/:rfid',
    context_wrap( request_funcs.get_member_rfid ) );


function default_db(): db_impl.DB
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

export function start( db?: db_impl.DB ): void
{
    if(! db) db = default_db();
    request_funcs.set_db( db );

    // Start server running
    httpServer.listen( PORT );
    logger.info( "Server running on port", PORT );
}

export function stop (): void
{
    httpServer.close();
}


if( process.argv[2] == "start" ) start();
