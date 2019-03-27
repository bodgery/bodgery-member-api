const bodyParser = require( 'body-parser' );
const express = require('express');
const fs = require( 'fs' );
const pg = require('pg');
const yaml = require( 'js-yaml' );
const request_funcs = require( './src/request_funcs.ts' );

var conf = yaml.safeLoad(
    fs.readFileSync( 'config.yaml', 'utf8' ),
    {
        filename: "config.yaml"
    }
);
var PORT = conf.port;

// Init server
const SERVER = express();
let httpServer = require( 'http' ).createServer( SERVER );

SERVER.use( bodyParser.json() );
SERVER.use( bodyParser.urlencoded({ extended: true }) );


// Init logger
let logger = require( 'logger' ).createLogger( conf.log_file );
logger.setLevel( conf.log_level );
logger.format = (level, date, message) => {
    return [
        "[" + date.toISOString() + "]"
        ,message
    ].join( " " );
};
let logger_wrap = (callback) => function (req, res) {
    logger.info( "Begin request to", req.method, req.path );
    let ret = callback( req, res, logger );
    logger.info( "Finished request to", req.method, req.path );
    return ret;
};


// Add server routing callbacks
SERVER.get('/', logger_wrap( request_funcs.get_versions ) );
SERVER.post('/v1/members', logger_wrap( request_funcs.post_members ) );
SERVER.get('/v1/members', logger_wrap( request_funcs.get_members ) );


// Start server running
httpServer.listen( PORT );
logger.info( "Server running on port", PORT );


module.exports = {
    app: SERVER
    ,set_db: ( new_db ) => { request_funcs.set_db( new_db ) }
    ,stop: () => { httpServer.close() }
};
