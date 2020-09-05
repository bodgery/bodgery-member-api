import {NextFunction, Request, RequestHandler, Response} from "express";
import {getCustomRepository} from "typeorm";
import {UserRepository} from "./typeorm/user_repository";
import {access_token as AccessToken} from "./typeorm/entities/access_token";
import {users as User} from "./typeorm/entities/users";

export type AuthProvider = (req: Request) => Promise<User | null>;

function get_token( req: Request ): string
{
    let auth_header = req.header( 'Authorization' ) || "";
    let tokens = auth_header.split( ' ' );
    let token = tokens[1];
    return token;
}

export async function BearerTokenProvider( req: Request ): Promise<User | null>
{
    const token = get_token( req );

    if (!token) {
        return null;
    }

    const repo = getCustomRepository(UserRepository);
    return await repo.findByAccessToken(token);
}

export async function SessionProvider( req: Request ): Promise<User | null>
{
    const email = req.session.username;

    console.log(`Loading session email: ${email}`);

    if (!email) {
        return null;
    }

    const repo = getCustomRepository(UserRepository);
    return await repo.findByEmail(email);
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
