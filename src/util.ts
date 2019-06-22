import * as db from "./db";
import * as fs from "fs";
import * as pg from "./db-pg";
import * as shortid from "shortid";
import * as yaml from "js-yaml";

const CONF_FILE = "./config.yaml";


export function error_handler (err)
{
    throw err;
}

export function get_pg_connection(
    conf_path: string = CONF_FILE
): pg.PG
{
    let conf = get_conf( conf_path );
    let db = new pg.PG(
        conf["db_host"]
        ,conf["db_port"]
        ,conf["db_name"]
        ,conf["db_user"]
        ,conf["db_password"]
    );
    return db;
}

export function get_conf(
    conf_path: string = CONF_FILE
): Object
{
    let conf = yaml.safeLoad(
        fs.readFileSync( conf_path, 'utf8' ),
        {
            filename: conf_path
        }
    );
    return conf;
}

export function test_member_data (
    rfid: string = shortid.generate()
): db.SimpleMember
{
    let email = shortid.generate() + "@example.com";
    let member_data = {
        rfid: rfid
        ,firstName: "Foo"
        ,lastName: "Bar"
        ,phone: "555 555 4567"
        ,email: email
    };
    return member_data;
}
