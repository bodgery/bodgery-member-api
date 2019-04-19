import * as db_impl from "./db";


export class MockDB
{
    client: any = null;
    members: Object = {};


    constructor( members: Object )
    {
        this.members = members;
    }


    add_member(
        member: db_impl.SimpleMember
        ,success_callback: () => void
        ,error_callback: (err: Error) => void
    ): boolean
    {
        let id = member.rfid;
        this.members[id] = {};
        this.members[id].simple_data = member;
        success_callback();
        return true;
    }

    get_member(
        member_id: string
        ,success_callback: ( member: db_impl.SimpleMember ) => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean
    {
        let member_matched = this.members[member_id];

        if( member_matched != null ) {
            success_callback( member_matched.simple_data );
        }
        else {
            no_member_found_callback(
                new Error( "Could not find match for member ID '"
                    + member_id + "'"
                )
            );
        }

        return true;
    }

    put_member_address(
        member_id: string
        ,address: db_impl.USAddress
        ,success_callback: () => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean
    {
        let member_matched = this.members[member_id];

        if( member_matched != null ) {
            member_matched.address = address;
            success_callback();
        }
        else {
            no_member_found_callback(
                new Error( "Could not find match for member ID '"
                    + member_id + "'"
                )
            );
        }

        return true;
    }
/*
    get_members(
        success_callback: ( members: Array<db_impl.Member> ) => void
        ,error_callback: ( err: Error ) => void
        ,id: string = null
        ,limit: number = null
        ,skip: number = null
        ,sort: string = null
    ): boolean
    {
        let members = this.members;

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

        success_callback( members );
        return true;
    }
 */

    end(): void
    {
        // Do nothing, and do it well
    }
}
