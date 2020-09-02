import * as fs from "fs";
import * as yaml from "js-yaml";
// import * as env from 'env-var';
import * as nconf from "nconf";
import nconf_yaml from "nconf-yaml";

interface AppConfig {
    port: number,
    deployment_type: "dev" | "prod",
    log_file: string,
    log_level: "debug" | "info" | "warn" | "error",
}

interface PasswordConfig {
    preferred_password_crypt_method: string,
}

interface SessionConfig {
    session_secret: string,
    session_length_sec: number
}

interface WildApricotConfig {
    wa_api_client: string,
    wa_api_secret: string,
    wa_account_id: number,
}

// TODO: Add Google and Email configuration

interface DatabaseConfig {
    db_user: string,
    db_password: string,
    db_name: string,
    db_host: string,
    db_port: number,
    db_ssl: boolean,
};

type Config = AppConfig & PasswordConfig & DatabaseConfig & WildApricotConfig;

const appConfigDefaults = {
    port: 3001,
    deployment_type: "dev",
    log_file: "dev.log",
    log_level: "info"
}

const passwordConfigDefaults = {
    preferred_password_crypt_method: "bcrypt_10"
};

const sessionConfigDefaults = {
    session_secret: "xxxx",
    session_length_sec: 3600000,
}

const wildApricotConfigDefaults = {
    wa_api_client: "",
    wa_api_secret: "",
    wa_account_id: 0,
}

const databaseConfigDefaults = {
    db_user: "bodgery",
    db_password: "",
    db_name: "bodgery_members",
    db_host: "localhost",
    db_port: 5432,
    db_ssl: false
}


export default function(): Config {
    return nconf.argv({
        port: {
            description: "Port to listen on",
            alias: "p",
            type: "number"
        }
    }).env({
        lowerCase: true,
        parseValues: true,
    }).file({
        file: 'config.yaml',
        format: nconf_yaml,
    })
    .defaults({
        ...appConfigDefaults,
        ...passwordConfigDefaults,
        ...sessionConfigDefaults,
        ...databaseConfigDefaults,
        ...wildApricotConfigDefaults,
    }).get()
}
