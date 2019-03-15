const express = require('express');
const fs = require( 'fs' );
const pg = require('pg');
const yaml = require( 'js-yaml' );
const request_funcs = require( './lib/request_funcs.js' );

var conf = yaml.safeLoad(
    fs.readFileSync( 'config.yaml', 'utf8' ),
    {
        filename: "config.yaml"
    }
);
var PORT = conf.port;

const server = express();


server.listen(PORT, () => console.log( "Server running on port " + PORT ));
server.get('/', request_funcs.versions );

module.exports.app = server;
