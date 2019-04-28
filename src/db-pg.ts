import * as pg from "pg";
import * as pg_escape from "pg-escape";
import * as db_impl from "./db";


export class PG
{
    client: any;


    constructor(
        host: string
        ,port: number
        ,name: string
        ,user: string
        ,pass: string
    )
    {
        this.client = new pg.Client({
            host: host
            ,port: port
            ,database: name
            ,user: user
            ,password: pass
        });
        this.client.connect();
    }


    add_member(
        member: db_impl.SimpleMember
        ,success_callback: (member_id) => void
        ,error_callback: (err: Error) => void
    ): boolean
    {
        let query = {
            name: "add-member"
            ,text: [
                "INSERT INTO members ("
                    ,"rfid"
                    ,",first_name"
                    ,",last_name"
                    ,",phone"
                    ,",email"
                ,") VALUES ($1, $2, $3, $4, $5) RETURNING member_id"
            ].join( " " )
            ,values: [
                member.rfid
                ,member.firstName
                ,member.lastName
                ,member.phone
                ,member.email
            ]
        };

        this.client.query( query, (err, res) => {
            if( err ) {
                error_callback( err );
            }
            else {
                success_callback( res.rows[0].member_id );
            }
        });

        return true;
    }

    get_member(
        member_id: string
        ,success_callback: ( member: db_impl.SimpleMember ) => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean
    {
        let query = {
            name: "get-member"
            ,text: [
                "SELECT"
                    ,"rfid"
                    ,",first_name"
                    ,",last_name"
                    ,",phone"
                    ,",email"
                    ,",photo"
                ,"FROM members WHERE member_id = $1"
            ].join( " " )
            ,values: [ member_id ]
        };

        this.client.query( query, (err, res) => {
            if( err ) {
                error_callback( err );
            }
            else if(! res.rowCount ) {
                no_member_found_callback(
                    new Error( "Could not find member for ID " + member_id )
                );
            }
            else {
                let member = res.rows[0];
                // Would like to use aliases in the SQL statement 
                // (e.g., "first_name AS firstName"), but PostgreSQL 
                // returns it in all lowercase
                member.firstName = member.first_name;
                member.lastName = member.last_name;
                delete member.first_name;
                delete member.last_name;
                success_callback( member );
            }
        });
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
        this.transaction(
            () => this.insert_address(
                address
                ,(addr_id) => {
                    this.update_user_address(
                        member_id
                        ,addr_id
                        ,success_callback
                        ,no_member_found_callback
                        ,error_callback
                    );
                }
                ,error_callback
            )
            ,error_callback
        );
        return true;
    }

    get_member_address(
        member_id: string
        ,success_callback: ( address: db_impl.USAddress ) => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean
    {
        let query = {
            name: "get-member-address"
            ,text: [
                "SELECT"
                    ,"address1"
                    ,",address2"
                    ,",city"
                    ,",state"
                    ,",zip"
                ,"FROM us_address"
                ,"JOIN members ON (members.address_id = us_address.id)"
                ,"WHERE members.member_id = $1"
            ].join( " " )
            ,values: [ member_id ]
        };

        this.client.query( query, (err, res) => {
            if( err ) {
                error_callback( err );
            }
            else if(! res.rowCount ) {
                no_member_found_callback(
                    new Error( "Could not find member for ID " + member_id )
                );
            }
            else {
                success_callback( res.rows[0] );
            }
        });

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
        let query = {
            name: "update-member-active"
            ,text: [
                "UPDATE members"
                ,"SET status = $1"
                ,"WHERE member_id = $2"
            ].join( " " )
            ,values: [
                is_active
                ,member_id
            ]
        };

        this.client.query( query, (err, res) => {
            if( err ) {
                error_callback( err );
            }
            else if(! res.rowCount) {
                no_member_found_callback(
                    new Error( "Could not find member for ID " + member_id )
                );
            }
            else {
                success_callback();
            }
        });

        return true;
    }

    get_member_is_active(
        member_id: string
        ,success_callback: ( is_active: boolean ) => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean
    {
        let query = {
            name: "get-member-active"
            ,text: [
                "SELECT status"
                ,"FROM members"
                ,"WHERE members.member_id = $1"
            ].join( " " )
            ,values: [ member_id ]
        };

        this.client.query( query, (err, res) => {
            if( err ) {
                error_callback( err );
            }
            else if(! res.rowCount ) {
                no_member_found_callback(
                    new Error( "Could not find member for ID " + member_id )
                );
            }
            else {
                success_callback( res.rows[0].status );
            }
        });
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
        let query = {
            name: "set-member-rfid"
            ,text: [
                "UPDATE members"
                ,"SET rfid = $1"
                ,"WHERE member_id = $2"
            ].join( " " )
            ,values: [
                rfid
                ,member_id
            ]
        };

        this.call_query(
            query
            ,(rows) => success_callback()
            ,no_member_found_callback
            ,error_callback
        );
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
        let query = {
            name: "get-member-rfid"
            ,text: [
                "SELECT status"
                ,"FROM members"
                ,"WHERE rfid = $1"
            ].join( " " )
            ,values: [ rfid ]
        };

        this.call_query(
            query
            ,(rows) => {
                if( rows[0].status ) {
                    success_callback()
                }
                else {
                    inactive_member_callback()
                }
            }
            ,no_member_found_callback
            ,error_callback
        );

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
        let query = {
            name: "add-user"
            ,text: [
                "INSERT INTO users ("
                    ,"email"
                    ,",password"
                    ,",password_salt"
                    ,",password_storage"
                ,") VALUES ($1, $2, $3, $4)"
            ].join( " " )
            ,values: [
                username
                ,password
                ,salt
                ,crypt_type
            ]
        };

        this.client.query( query, (err, res) => {
            if( err ) {
                error_callback( err );
            }
            else {
                success_callback();
            }
        });
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
        let query = {
            name: "get-user-password"
            ,text: [
                "SELECT"
                    ,"password"
                    ,",password_storage"
                    ,",password_salt"
                ,"FROM users"
                ,"WHERE email = $1"
            ].join( " " )
            ,values: [ username ]
        };

        this.call_query(
            query
            ,(rows) => success_callback({
                password: rows[0].password
                ,crypt_type: rows[0].password_storage
                ,salt: rows[0].password_salt
            })
            ,no_user_found_callback
            ,error_callback
        );
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
        let query = {
            name: "set-user-password"
            ,text: [
                "UPDATE users"
                ,"SET"
                    ,"password = $1"
                    ,",password_storage = $2"
                    ,",password_salt = $3"
                ,"WHERE email = $4"
            ].join( " " )
            ,values: [
                new_password
                ,new_crypt_method
                ,salt
                ,username
            ]
        };

        this.call_query(
            query
            ,(rows) => success_callback()
            ,no_user_found_callback
            ,error_callback
        );
    }
/*
    get_members(
        success_callback: ( members: Array<db_impl.SimpleMember> ) => void
        ,error_callback: ( err: Error ) => void
        ,id: string = null
        ,limit: number = null
        ,skip: number = null
        ,sort: string = null
    ): boolean
    {
        let placeholder = this.placeholder_generator();

        // TODO fetch address, approved tools, and profile questions
        let query_text = [
            "SELECT"
                ,"id"
                ,"keyfob_id"
                ,",first_name AS firstName"
                ,",last_name AS lastName"
                ,",full_name AS name"
                ,",photo"
                ,",phone"
                ,",address1"
                ,",address2"
                ,",city"
                ,",state"
                ,",zip"
                ,",county"
                ,",country"
            ,"FROM members"
            ,"JOIN us_address ON (members.address_id = us_address.id)"
        ];
        let name = "get-member";
        let values = [];

        if( id != null ) {
            name += "-by-id";
            query_text.push( "WHERE keyfob_id = " + placeholder() );
            values.push( id );
        }
        if( sort != null ) {
            name += "-order-by";
            // We can't use placeholders on column names, so escape 
            // it safely here
            query_text.push( pg_escape( "ORDER BY %I", sort ) );
        }
        if( limit != null ) {
            name += "-limit";
            query_text.push( "LIMIT " + placeholder() );
            values.push( limit );
        }
        if( skip != null ) {
            name += "-offset";
            query_text.push( "OFFSET " + placeholder() );
            values.push( skip );
        }

        let query = {
            name: name
            ,text: query_text.join( " " )
            ,values: values
        };
        this.client.query( query, (err, res) => {
            if( err ) {
                error_callback( err );
            }
            else {
                let results = res.rows.map( (row) => {
                    return {
                        id: row.id
                        ,keyfob_id: row.keyfob_id
                        ,name: row.name
                        ,firstName: row.firstName
                        ,lastName: row.lastName
                        ,photo: row.photo
                        ,phone: row.phone
                        ,address: {
                            address1: row.address1
                            ,address2: row.address2
                            ,city: row.city
                            ,state: row.state
                            ,zip: row.zip
                            ,county: row.county
                            ,country: row.country
                        }
                        ,approvedTools: []
                    };
                });
                this.gather_approved_tools( results, (res) => {
                    success_callback( res );
                }, error_callback );
            }
        });
        return true;
    }
*/

    end(): void
    {
        this.client.end();
    }


    private transaction(
        success_callback: () => void
        ,error_callback: (err: Error) => void
    ): void
    {
        this.client.query( 'BEGIN', (err, res) => {
            if( err ) {
                error_callback( err );
            }
            else {
                this.client.query( 'COMMIT', (err, res) => {
                    if( err ) {
                        error_callback( err );
                    }
                    else {
                        success_callback();
                    }
                });
            }
        });
    }

    private placeholder_generator():
        () => string
    {
        let placeholder_num: number = 1;
        return () => {
            let placeholder = "$" + placeholder_num;
            placeholder_num++;
            return placeholder;
        };
    }

    private call_query(
        query
        ,success_callback: ( rows: Array<any> ) => void
        ,no_rows_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): void
    {
        this.client.query( query, (err, res) => {
            if( err ) {
                error_callback( err );
            }
            else if(! res.rowCount ) {
                no_rows_callback();
            }
            else {
                success_callback( res.rows );
            }
        });
    }


    private insert_address(
        address: db_impl.USAddress
        ,success_callback: (addr_id: number) => void
        ,error_callback: ( err: Error ) => void
    ): void
    {
        let query = {
            name: "add-address"
            ,text: [
                "INSERT INTO us_address ("
                    ,"address1"
                    ,",address2"
                    ,",city"
                    ,",state"
                    ,",zip"
                ,") VALUES ($1, $2, $3, $4, $5) RETURNING id"
            ].join( " " )
            ,values: [
                address.address1
                ,address.address2
                ,address.city
                ,address.state
                ,address.zip
            ]
        };

        this.client.query( query, (err, res) => {
            if( err ) {
                error_callback( err );
            }
            else {
                success_callback( res.rows[0].id );
            }
        });
    }

    private update_user_address(
        member_id: string
        ,addr_id: number
        ,success_callback: () => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): void
    {
        let query = {
            name: "update-user-address"
            ,text: [
                "UPDATE members"
                ,"SET address_id = $1"
                ,"WHERE member_id = $2"
            ].join( " " )
            ,values: [
                addr_id
                ,member_id
            ]
        };

        this.client.query( query, (err, res) => {
            if( err ) {
                error_callback( err );
            }
            else if(! res.rowCount) {
                no_member_found_callback(
                    new Error( "Could not find member for ID " + member_id )
                );
            }
            else {
                success_callback();
            }
        });
    }
}
