import {NextFunction, Request, RequestHandler, Response} from "express";
import {users as User} from "./typeorm/entities/users";
import {access_token as AccessToken} from "./typeorm/entities/access_token";
import {getRepository} from "typeorm";

export type AuthProvider = (req: Request) => Promise<User | null>;

function get_token( req: Request ): string
{
    let auth_header = req.header( 'Authorization' ) || "";
    let tokens = auth_header.split( ' ' );
    let token = tokens[1];
    return token;
}

async function get_user_for_token(token: string): Promise<User | null> {
    const repo = getRepository(AccessToken);

    const tokenModel = await repo.findOne({
        relations: ["user"],
        where: {token},
    });

    // TODO: Need to upgrade typescript to get null coalescing
    // return tokenModel?.user;
    return tokenModel ? tokenModel.user : null;
}

async function get_user_for_email(email: string): Promise<User | null> {
    const repo = getRepository(User);

    return await repo.findOne({ email });
}

export async function BearerTokenProvider( req: Request ): Promise<User | null>
{
    const token = get_token( req );

    if (token === null || token === "") {
        return null;
    }
    return await get_user_for_token( token );
}

export async function SessionProvider( req: Request ): Promise<User | null>
{
    const email = req.session.username;

    console.log(`Loading session email: ${email}`);

    if (email === null || email === "") {
        return null;
    }

    return await get_user_for_email( email );
}

export async function TestUserProvider( req: Request ): Promise<User | null>
{
    if( process.env['TEST_RUN'] ) {
        // Return a Test User
        const user = new User();
        user.id = 0;
        user.email = "test@test.com";
        user.password = "";
        user.password_salt = "";
        user.password_storage = "";

        return user;
    }

    return null;
}

async function asyncFirstMap<T, U>( arr: T[], map: (T) => Promise<U | null> ): Promise<U | null> {
    for (const item of arr) {
        const result = await map(item);
        if (result !== null) {
            return result;
        }
    }
    return null;
}

// Need to declare our user property on the Request object
declare module 'express' {
    interface Request {
        user?: User | null;
    }
}

export function authentication_middleware(providers: AuthProvider[]): RequestHandler
{
    return async (req: Request, res: Response, next: NextFunction) => {
        req.user = await asyncFirstMap(providers, provider => provider(req));
        next()
    }
}

export function user_required_or_redirect(logger, redirect_path: string): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user) {
            logger.info( `User ${req.user.id} authenticated to access ${ req.path }` );
            next();
        } else {
            logger.error( "Anonymous visitor not allowed to access " + req.path );
            res.redirect(redirect_path);
        };
    };
}

export function user_required(logger): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user) {
            logger.info( `User ${req.user.id} authenticated to access ${ req.path }` );
            next();
        } else {
            logger.error( "Anonymous visitor not allowed to access " + req.path );
            res.sendStatus(401);
        };
    };
}
