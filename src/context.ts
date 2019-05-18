import * as password from "./password";


export interface Logger
{
    fatal(...args): void;
    error(...args): void;
    warn(...args): void;
    info(...args): void;
    debug(...args): void;
}


export class Context
{
    public conf: any;
    public logger: Logger;
    public password_checker: password.Checker;


    constructor(
        conf: any
        ,logger: Logger
        ,password_checker: password.Checker
    ) {
        this.conf = conf;
        this.logger = logger;
        this.password_checker = password_checker;
    }

    isDev(): boolean
    {
        return "dev" == this.conf['deployment_type'];
    }

    isProd(): boolean
    {
        return "prod" == this.conf['deployment_type'];
    }
}
