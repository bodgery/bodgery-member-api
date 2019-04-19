import * as db_impl from "./db";


export class MockDB
{
    client: any = null;
    members: Array<db_impl.SimpleMember> = [];


    constructor( members: Array<db_impl.SimpleMember> )
    {
        this.members = members;
    }


    add_member(
        member: db_impl.SimpleMember
        ,success_callback: () => void
        ,error_callback: (err: Error) => void
    ): boolean
    {
        this.members.push( member );
        success_callback();
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
