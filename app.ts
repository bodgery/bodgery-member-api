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

const SERVER = express();
let httpServer = require( 'http' ).createServer( SERVER );


SERVER.use( bodyParser.json() );
SERVER.use( bodyParser.urlencoded({ extended: true }) );

SERVER.get('/', request_funcs.get_versions );
SERVER.post('/v1/members', request_funcs.post_members );
SERVER.get('/v1/members', request_funcs.get_members );


httpServer.listen( PORT );
console.log( "Server running on port " + PORT );


module.exports = {
    app: SERVER
    ,set_db: ( new_db ) => { request_funcs.set_db( new_db ) }
    ,stop: () => { httpServer.close() }
};
