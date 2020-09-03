import * as app from '../app';
import * as db_impl from '../src/db';
import * as fs from 'fs';
import config from '../src/config';
import * as password from '../src/password';
import * as pg from '../src/db-pg';
import * as prompt from 'password-prompt';
import * as readline from 'readline';
import * as yaml from 'js-yaml';

const conf = config();
const ui = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const db: db_impl.DB = new pg.PG(
    conf.db_host,
    conf.db_port,
    conf.db_name,
    conf.db_user,
    conf.db_password,
);
const password_handler = new password.Checker(
    conf['preferred_password_crypt_method'],
    db,
);

ui.question('Username: ', user => {
    ui.close();

    prompt('Password: ', {
        method: 'hide',
    }).then(pass =>
        password_handler.addNewUser(
            user,
            pass,
            () => {},
            err => {
                throw err;
            },
        ),
    );
});
