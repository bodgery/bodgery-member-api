import * as password from "./password";
import * as wa_api from "./wild_apricot";


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
    public wa: wa_api.WA;


    constructor(
        conf: any
        ,logger: Logger
        ,password_checker: password.Checker
        ,wa: wa_api.WA
    ) {
        this.conf = conf;
        this.logger = logger;
        this.password_checker = password_checker;
        this.wa = wa;
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
