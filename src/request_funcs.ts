import * as c from "./context";
import * as db_impl from "./db";
import * as valid from "./validation";


let db : db_impl.DB;
export function set_db (new_db: db_impl.DB)
{
    db = new_db;
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
        ]);
    }
    catch (err) {
        logger.error( "Errors: " + err.toString() );
        res
            .status( 400 )
            .json({
                error: err.toString()
            });
    }

    db.add_member( body
        ,() => {
            logger.info( "Member added successfully" );
            res
                .status( 204 )
                .end();
        }
        ,( err: Error ) => {
            logger.error( "Error writing to database: " + err.toString() );
            res
                .status( 500 )
                .end();
        }
    );
}
