import * as db_impl from "./db";


export class MockDB
{
    members: Object = {};
    users: Object = {};
    rfid_log: Array<[ string, boolean ]>;


    constructor(
        members: Object
        ,users: Object
        ,rfid_log?: Array<[ string, boolean ]>
    )
    {
        this.members = members;
        this.users = users;
        this.rfid_log = rfid_log || [];
    }


    add_member(
        member: db_impl.SimpleMember
        ,success_callback: ( member_id ) => void
        ,error_callback: (err: Error) => void
    ): boolean
    {
        let id = member.rfid;
        this.members[id] = {};
        this.members[id].simple_data = member;
        success_callback( id );
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

    set_member_photo(
        member_id: string
        ,path: string
        ,success_callback: () => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: (err: Error) => void
    ): boolean
    {
        if( ! this.members[member_id] ){
            this.members[member_id] = {};
        }
        this.members[member_id].photo = path;
        success_callback();
        return true;
    }

    get_member_photo(
        member_id: string
        ,success_callback: ( path: string ) => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean
    {
        if( this.members[member_id].photo ) {
            success_callback( this.members[member_id].photo );
        }
        else {
            no_member_found_callback(
                new Error( "No member found with ID " + member_id )
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

    get_member_address(
        member_id: string
        ,success_callback: ( address: db_impl.USAddress ) => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean
    {
        let member_matched = this.members[member_id];

        if( member_matched != null ) {
            success_callback( member_matched.address );
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

    set_member_is_active(
        member_id: string
        ,is_active: boolean
        ,success_callback: () => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean
    {
        let member_matched = this.members[member_id];

        if( member_matched != null ) {
            member_matched.is_active = is_active;
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

    get_member_is_active(
        member_id: string
        ,success_callback: ( is_active: boolean ) => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean
    {
        let member_matched = this.members[member_id];

        if( member_matched != null ) {
            success_callback( member_matched.is_active );
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

    put_member_wild_apricot(
        member_id: string
        ,wild_apricot_id: string
        ,success_callback: () => void
        ,no_member_found_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): boolean
    {
        let member_matched = this.members[member_id];

        if( member_matched != null ) {
            member_matched['full_data']['wild_apricot_id'] = wild_apricot_id
            success_callback();
        }
        else {
            no_member_found_callback();
        }

        return true;
    }

    get_member_wild_apricot(
        member_id: string
        ,success_callback: ( wild_apricot_id: string ) => void
        ,no_member_found_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): boolean
    {
        let member_matched = this.members[member_id];

        if( member_matched != null ) {
            success_callback( member_matched.wild_apricot_id );
        }
        else {
            no_member_found_callback();
        }

        return true;
    }

    set_member_rfid(
        member_id: string
        ,rfid: string
        ,success_callback: () => void
        ,no_member_found_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): boolean
    {
        let member_matched = this.members[member_id];

        if( member_matched != null ) {
            member_matched.rfid = rfid;
            success_callback();
        }
        else {
            no_member_found_callback();
        }

        return true;
    }

    get_member_rfid(
        rfid: string
        ,success_callback: () => void
        ,inactive_member_callback: () => void
        ,no_member_found_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): boolean
    {
        let member_id_matched = Object.keys( this.members )
            .find( (_, i, obj) => this.members[_].rfid == rfid );

        if( member_id_matched != null ) {
            let member_matched = this.members[member_id_matched];
            if( member_matched.is_active ) {
                success_callback();
            }
            else {
                inactive_member_callback();
            }
        }
        else {
            no_member_found_callback();
        }

        return true;
    }

    log_rfid_entry(
        rfid: string
        ,is_active: boolean
        ,success_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): boolean
    {
        this.rfid_log.push([ rfid, is_active ]);
        success_callback();
        return true;
    }

    add_user(
        username: string
        ,password: string
        ,salt: string
        ,crypt_type: string
        ,success_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): void
    {
        // TODO
    }

    get_password_data_for_user(
        username: string
        ,success_callback: ( stored_data: {
            password: string
            ,crypt_type: string
            ,salt: string
        }) => void
        ,no_user_found_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): void
    {
        if(! this.users.hasOwnProperty( username ) ) {
            no_user_found_callback();
            return;
        }
        let user = this.users[username];

        success_callback({
            password: user.password
            ,crypt_type: user.crypt_type
            ,salt: user.salt
        });
    }

    set_password_data_for_user(
        username: string
        ,new_password: string
        ,new_crypt_method: string
        ,salt: string
        ,success_callback: () => void
        ,no_user_found_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): void
    {
        let user = this.users[username];
        if(! user) no_user_found_callback();

        user.password = new_password;
        user.crypt_type = new_crypt_method;
        user.salt = salt;

        success_callback();
    }

    session_store( express_session )
    {
        return null;
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
