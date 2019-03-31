import * as db_impl from "./db";

export class MockDB
{
    members: Array<db_impl.Member> = [];


    constructor( members: Array<db_impl.Member> )
    {
        this.members = members;
    }


    add_member( member: db_impl.Member ): boolean
    {
        this.members.push( member );
        return true;
    }

    get_members(): Array<db_impl.Member>
    {
        return this.members;
    }
}
