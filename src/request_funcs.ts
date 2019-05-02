import * as c from "./context";
import * as db_impl from "./db";
import * as valid from "./validation";


let db : db_impl.DB;
export function set_db (new_db: db_impl.DB)
{
    db = new_db;
}

function get_generic_db_error( logger, res )
{
    return ( err: Error ) => {
        logger.error( "Error writing to database: " + err.toString() );
        res
            .status( 500 )
            .end();
    };
}

function get_member_id_not_found_error( logger, res, member_id )
{
    return () => {
        logger.info( "No member found for RFID " + member_id );
        res
            .status( 404 )
            .end();
    };
}

function handle_generic_validation_error( logger, res, err ): void
{
    logger.error( "Errors: " + err.toString() );
    res
        .status( 400 )
        .json({
            error: err.toString()
        });
}

export function get_versions ( req, res, ctx: c.Context )
{
    res
        .status(200)
        .json([ '/v1' ]);
}

export function put_member( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    let body = req.body;
    try {
        valid.validate( body, [
            valid.isInteger( 'rfid' )
            ,valid.isName( 'firstName' )
            ,valid.isName( 'lastName' )
            ,valid.isUSPhone( 'phone' )
            ,valid.isPublicEmail( 'email' )
            ,valid.isUrl( 'photo' )
         ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    db.add_member( body
        ,() => {
            logger.info( "Member added successfully" );
            res
                .status( 204 )
                .end();
        }
        ,get_generic_db_error( logger, res )
    );
}

export function get_member( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    try {
        valid.validate( req.params, [
            valid.isInteger( 'member_id' )
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    let member_id = req.params.member_id;

    db.get_member( member_id
        ,( member: db_impl.SimpleMember ) => {
            logger.info( "Fetched member" );
            res
                .status( 200 )
                .send( member )
                .end();
        }
        ,get_member_id_not_found_error( logger, res, member_id )
        ,get_generic_db_error( logger, res )
    );
}

export function put_member_address( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    let body = req.body;

    try {
        valid.validate( req.params, [
            valid.isInteger( 'member_id' )
        ]);
        valid.validate( body, [
            valid.isUSAddress()
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    let member_id = req.params.member_id;

    db.put_member_address( member_id, body
        ,() => {
            logger.info( "Address set on member successfully" );
            res
                .status( 204 )
                .end();
        }
        ,get_member_id_not_found_error( logger, res, member_id )
        ,get_generic_db_error( logger, res )
    );
}

export function get_member_address( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    try {
        valid.validate( req.params, [
            valid.isInteger( 'member_id' )
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    let member_id = req.params.member_id;

    db.get_member_address( member_id
        ,( address: db_impl.USAddress ) => {
            logger.info( "Fetched member address" );
            res
                .status( 200 )
                .send( address )
                .end();
        }
        ,get_member_id_not_found_error( logger, res, member_id )
        ,get_generic_db_error( logger, res )
    );
}

export function put_member_is_active( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    try {
        valid.validate( req.params, [
            valid.isInteger( 'member_id' )
        ]);
        valid.validate( req.body, [
            valid.isBoolean( 'is_active' )
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }


    let member_id = req.params.member_id;
    let is_active = req.body.is_active;
    db.set_member_is_active( member_id, is_active
        ,() => {
            logger.info( "Set is active: " + is_active );
            res
                .status( 200 )
                .send()
                .end();
        }
        ,get_member_id_not_found_error( logger, res, member_id )
        ,get_generic_db_error( logger, res )
    );
}

export function get_member_is_active( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    try {
        valid.validate( req.params, [
            valid.isInteger( 'member_id' )
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    let member_id = req.params.member_id;
    db.get_member_is_active( member_id
        ,(is_active: boolean) => {
            logger.info( "Set is active: " + is_active );
            res
                .status( 200 )
                .send( is_active )
                .end();
        }
        ,get_member_id_not_found_error( logger, res, member_id )
        ,get_generic_db_error( logger, res )
    );
}

export function put_member_rfid( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    try {
        valid.validate( req.params, [
            valid.isInteger( 'member_id' )
        ]);
        valid.validate( req.body, [
            valid.isInteger( 'rfid' )
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }


    let member_id = req.params.member_id;
    let rfid = req.body.rfid;
    db.set_member_rfid( member_id, rfid
        ,() => {
            // Don't put RFID in log
            logger.info( "Set RFID on member " + member_id );
            res
                .status( 200 )
                .send()
                .end();
        }
        ,get_member_id_not_found_error( logger, res, member_id )
        ,get_generic_db_error( logger, res )
    );
}

export function get_member_rfid( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    try {
        valid.validate( req.params, [
            valid.isInteger( 'rfid' )
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    let rfid = req.params.rfid;
    db.get_member_rfid( rfid
        ,() => {
            // Don't put RFID tag in log
            logger.info( "RFID check OK" );
            res
                .status( 200 )
                .send()
                .end();
        }
        ,() => {
            logger.info( "RFID is inactive for RFID check" );
            res
                .status( 403 )
                .send()
                .end();
        }
        ,() => {
            logger.info( "RFID is not found for check" );
            res
                .status( 404 )
                .send()
                .end();
        }
        ,get_generic_db_error( logger, res )
    );
}

export function login_user( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    try {
        valid.validate( req.body, [
            valid.isPublicEmail( 'username' )
            // Password field is allowed to be anything
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    let username = req.body.username;
    let password = req.body.password;

    let is_match_callback = () => {
        logger.info( "User " + username + " logged in successfully" );
        req.session.username = username;
        req.session.is_logged_in = true;

        // TODO send to default account page
        res
            .status( 200 )
            .send()
            .end();
    };

    let is_not_match_callback = () => {
        logger.info( "User " + username + " failed to login" );

        // TODO send back login page
        res
            .status( 403 )
            .send()
            .end();
    };

    let checker = ctx.password_checker;
    checker.isMatch({
        username: username
        ,passwd: password
        ,is_match_callback: is_match_callback
        ,is_not_match_callback: is_not_match_callback
    });
}

export function logout_user( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    let username = req.session.username;
    let is_logged_in = req.session.is_logged_in;

    if( is_logged_in ) {
        logger.info( "Username " + username + " is logging out" );
        req.session.destroy( () => {
            // TODO send to login page
            res
                .status( 200 )
                .send()
                .end();
        });
    }
    else {
        logger.info( "Asked for logout, but is not logged in" );
        res
            .status( 403 )
            .send()
            .end();
    }
}

export function is_user_logged_in( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    let username = req.session.username;
    let is_logged_in = req.session.is_logged_in;

    if(! req.session.check_login) req.session.check_login = 0;
    req.session.check_login += 1;

    logger.info( "Username [" + username + "], checking logged in setting"
        + ", which is " + is_logged_in );

    res
        .status( is_logged_in ? 200 : 403 )
        .send({ username: username })
        .end();
}
