import * as valid from "./validation";
import * as db_impl from "./db";


let db : db_impl.DB;
export function set_db (new_db: db_impl.DB)
{
    db = new_db;
}


export function get_versions ( req, res, logger )
{
    res
        .status(200)
        .json([ '/v1' ]);
}

export function post_members( req, res, logger )
{
    var body = req.body;
    try {
        valid.validate( body, [
            valid.isIdentifier( 'id' )
            ,valid.isWords( 'name' )
            ,valid.isName( 'firstName' )
            ,valid.isName( 'lastName' )
            ,valid.isUSAddress( 'address' )
            ,valid.isUrl( 'photo' )
            // TODO approvedTools
            ,valid.isUSPhone( 'phone' )
            // TODO questions
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

export function get_members( req, res, logger )
{
    let body = req.body || {};
    let id = body['id'] || null;
    let limit = body['limit'] || null;
    let skip = body['skip'] || null;
    let sort = body['sort'] || null;

    try {
        valid.validate( body, [
            valid.isIdentifier( 'id', true )
            ,valid.isInteger( 'limit', true )
            ,valid.isInteger( 'skip', true )
            ,valid.isName( 'sort', true )
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


    db.get_members(
        ( members: Array<db_impl.Member> ) => {
            logger.info( "Returning " + members.length + " members" );
            res
                .status( 200 )
                .send( members );
        }
        ,( err: Error ) => {
            logger.error( "Error fetching members: " + err.toString() );
            res
                .status( 500 )
                .end();
        }
        ,id
        ,limit
        ,skip
        ,sort
    );
}
