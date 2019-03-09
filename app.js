const express = require('express');
const server = express();
const PORT = 80;
const pg = require('pg');

server.listen(PORT, () => console.log("Server running"));
server.get('/', (req, res) => res.status(200).send('hello'));
