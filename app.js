const express = require('express');
const fs = require( 'fs' );
const pg = require('pg');
const yaml = require( 'js-yaml' );

var conf = yaml.safeLoad(
    fs.readFileSync( 'config.yaml', 'utf8' ),
    {
        filename: "config.yaml"
    }
);
var PORT = conf.port;

const server = express();


server.listen(PORT, () => console.log("Server running"));
server.get('/', (req, res) => res.status(200).send('hello'));
