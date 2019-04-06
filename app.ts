import * as bodyParser from "body-parser";
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


// Init logger
let logger = require( 'logger' ).createLogger( conf.log_file );
logger.setLevel( conf.log_level );
logger.format = ( level, date, message ) => message;
let logger_wrap = (callback) => function (req, res) {
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

    request_logger.info( "Begin request to", req.method, req.path );
    let ret = callback( req, res, request_logger );
    request_logger.info( "Finished request to", req.method, req.path );
    return ret;
};


// Add server routing callbacks
SERVER.get('/', logger_wrap( request_funcs.get_versions ) );
SERVER.post('/v1/members', logger_wrap( request_funcs.post_members ) );
SERVER.get('/v1/members', logger_wrap( request_funcs.get_members ) );


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
