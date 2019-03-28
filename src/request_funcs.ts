import * as valid from "./validation";


export interface USAddress
{
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    county: string;
    country: string;
}

export interface Member
{
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    address: USAddress;
    photo: string;
    phone: string;
    // TODO
    profile: Array<string>;
    // TODO
    approvedTools: Array<string>;
}

export interface DB
{
    add_member( member: Member ): boolean;
    get_members(): Array<Member>;
}


let db : DB;
export function set_db (new_db: DB)
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
            valid.isInteger( 'id' )
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
        console.log( "Errors: " + err.toString() );
        res
            .status( 400 )
            .json({
                error: err.toString()
            });
    }

    // TODO add with an async callback
    db.add_member( body );

    res
        .status( 204 )
        .end();
}

export function get_members( req, res, logger )
{
    // TODO validate params
    let body = req.body || {};
    let id = body['id'];
    let limit = body['limit'];
    let skip = body['skip'];
    let sort = body['sort'];

    let members: Array<Member> = db.get_members();
    // TODO most of this should be in db.get_members()
    if( id ) {
        members = members.filter( function (member) {
            return member.id == id;
        });
    }
    if( sort ) {
        members = members.sort( function ( a, b ) {
            return a[sort].localeCompare( b[sort] );
        });
    }
    if( skip ) {
        members = members.filter( function (member, index) {
            return index >= skip;
        });
    }
    if( limit ) {
        members = members.filter( function (member, index) {
            return index < limit;
        });
    }

    res
        .status( 200 )
        .send( members );
}
