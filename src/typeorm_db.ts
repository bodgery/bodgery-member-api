import * as path from "path";
import { Config } from "./config";

import {createConnection as typeormCreateConnection, Connection } from "typeorm";

function typeorm_args( conf: Config )
{
    return {
        "name": "default"
        ,"type": "postgres" as 'postgres'
        ,"host": <string> conf.db_host
        ,"port": <number> conf.db_port
        ,"username": <string> conf.db_user
        ,"password": <string> conf.db_password
        ,"database": <string> conf.db_name
        ,"schema": "public"
        ,"synchronize": false
        ,"logging": true
        ,"entities": [
            path.join(__dirname, "typeorm/entities/*.{js,ts}")
        ]
        ,...conf.db_ssl && {
            extra: {
                ssl: true
            }
            ,ssl: {
                rejectUnauthorized: false
            }
        }
    };
}

export default async function createConnection( conf: Config ): Promise<Connection> {
    return await typeormCreateConnection( typeorm_args( conf ) );
}
