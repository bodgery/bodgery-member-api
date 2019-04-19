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


    constructor(
        conf: any
        ,logger: Logger
    ) {
        this.conf = conf;
        this.logger = logger;
    }
}
