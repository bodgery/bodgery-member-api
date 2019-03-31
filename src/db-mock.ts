import * as db_impl from "./db";


export class MockDB
{
    members: Array<db_impl.Member> = [];


    constructor( members: Array<db_impl.Member> )
    {
        this.members = members;
    }


    add_member(
        member: db_impl.Member
        ,success_callback: () => void
        ,error_callback: (err: Error) => void
    ): boolean
    {
        this.members.push( member );
        success_callback();
        return true;
    }

    get_members(
        success_callback: ( members: Array<db_impl.Member> ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean
    {
        success_callback( this.members );
        return true;
    }
}
