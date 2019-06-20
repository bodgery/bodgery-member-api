import * as db_impl from "./db";
import * as pg from "pg";
import * as pg_escape from "pg-escape";
import * as session from "connect-pg-simple";


let no_rows_callback_builder = (member_id, callback) => {
    return () => callback(
        new Error( "Could not find member for ID " + member_id )
    );
};

let success_no_rows_callback_builder = (success_callback) => {
    return (rows) => success_callback();
};

let success_first_rows_callback_builder = (success_callback) => {
    return (rows) => success_callback( rows[0] );
};


export class PG
{
    private pool: any;


    constructor(
        host: string
        ,port: number
        ,name: string
        ,user: string
        ,pass: string
    )
    {
        this.pool = new pg.Pool({
            host: host
            ,port: port
            ,database: name
            ,user: user
            ,password: pass
        });
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

        let main_callback = (rows) => success_callback( rows[0].member_id );

        this.call_query(
            query
            ,main_callback
            ,null
            ,error_callback
        );

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
                ,"FROM members WHERE member_id = $1"
            ].join( " " )
            ,values: [ member_id ]
        };

        let main_callback = (rows) => {
            let member = rows[0];
            // Would like to use aliases in the SQL statement 
            // (e.g., "first_name AS firstName"), but PostgreSQL 
            // returns it in all lowercase
            member.firstName = member.first_name;
            member.lastName = member.last_name;
            delete member.first_name;
            delete member.last_name;
            success_callback( member );
        };

        this.call_query(
            query
            ,main_callback
            ,no_rows_callback_builder( member_id, no_member_found_callback )
            ,error_callback
        );

        return true;
    }

    set_member_photo(
        member_id: string
        ,path: string
        ,success_callback: () => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean
    {
        let query = {
            name: "update-member-photo"
            ,text: [
                "UPDATE members"
                ,"SET photo = $1"
                ,"WHERE member_id = $2"
            ].join( " " )
            ,values: [
                path
                ,member_id
            ]
        };

        this.call_query(
            query
            ,success_no_rows_callback_builder( success_callback )
            ,no_rows_callback_builder( member_id, no_member_found_callback )
            ,error_callback
        );

        return true;
    }

    get_member_photo(
        member_id: string
        ,success_callback: ( path: string ) => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean
    {
        let query = {
            name: "get-member-photo"
            ,text: [
                "SELECT"
                    ,"photo"
                ,"FROM members WHERE member_id = $1"
            ].join( " " )
            ,values: [ member_id ]
        };

        let main_callback = (rows) => {
            let member = rows[0];
            let photo = member.photo;
            success_callback( photo );
        };

        this.call_query(
            query
            ,main_callback
            ,no_rows_callback_builder( member_id, no_member_found_callback )
            ,error_callback
        );

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
            (client, done) => this.insert_address(
                client
                ,address
                ,(addr_id) => {
                    this.update_user_address(
                        client
                        ,member_id
                        ,addr_id
                        ,done
                        ,no_member_found_callback
                        ,error_callback
                    );
                }
                ,error_callback
            )
            ,success_callback
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

        let main_callback = (rows) => success_callback( rows[0] );

        this.call_query(
            query
            ,success_first_rows_callback_builder( success_callback )
            ,no_rows_callback_builder( member_id, no_member_found_callback )
            ,error_callback
        );

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
        let query = {
            name: "update-member-wild-apricot"
            ,text: [
                "UPDATE members"
                ,"SET wildapricot_id = $1"
                ,"WHERE member_id = $2"
            ].join( " " )
            ,values: [
                wild_apricot_id
                ,member_id
            ]
        };

        this.call_query(
            query
            ,success_no_rows_callback_builder( success_callback )
            ,no_rows_callback_builder( member_id, no_member_found_callback )
            ,error_callback
        );

        return true;
    }

    get_member_wild_apricot(
        member_id: string
        ,success_callback: ( wild_apricot_id: string ) => void
        ,no_member_found_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): boolean
    {
        let query = {
            name: "get-member-wild-apricot"
            ,text: [
                "SELECT"
                    ,"wildapricot_id"
                ,"FROM members"
                ,"WHERE member_id = $1"
            ].join( " " )
            ,values: [ member_id ]
        };

        let main_callback = (rows) => success_callback(
            rows[0]['wildapricot_id'] );

        this.call_query(
            query
            ,main_callback
            ,no_rows_callback_builder( member_id, no_member_found_callback )
            ,error_callback
        );

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

        this.call_query(
            query
            ,success_no_rows_callback_builder( success_callback )
            ,no_rows_callback_builder( member_id, no_member_found_callback )
            ,error_callback
        );

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

        let main_callback = (rows) => {
            success_callback( rows[0].status );
        };

        this.call_query(
            query
            ,main_callback
            ,no_rows_callback_builder( member_id, no_member_found_callback )
            ,error_callback
        );

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

        this.call_query(
            query
            ,success_no_rows_callback_builder( success_callback )
            ,null
            ,error_callback
        );
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
            ,success_no_rows_callback_builder( success_callback )
            ,no_user_found_callback
            ,error_callback
        );
    }

    session_store( express_session )
    {
        let pg_session = session( express_session );
        let full_session = new pg_session({
            pool: this.pool
        });
        return full_session;
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
        this.pool.end();
    }


    private transaction(
        transaction_callback: (client, done) => void
        ,success_callback: () => void
        ,error_callback: (err: Error) => void
    ): void
    {
        let abort = (client, done) => {
            client.query( 'ROLLBACK', (err, res) => {
                done();
                if( err ) {
                    throw err;
                }
                error_callback( err );
            });
        };

        let finish = (client, done) => {
            client.query( 'COMMIT', (err, res) => {
                if( err ) {
                    error_callback( err );
                }
                done();
            });
        };

        this.pool.connect( (err, client, done) => {
            client.query( 'BEGIN', (err, res) => {
                if( err ) {
                    abort( client, done );
                }
                else {
                    try {
                        transaction_callback( client, () => {
                            finish( client, () => {
                                done();
                                success_callback();
                            });
                        });
                    }
                    catch( err ) {
                        abort( client, done );
                    }
                }
            });
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
        ,error_callback?: ( err: Error ) => void
        ,client?
    ): void
    {
        let main_callback = (client) => {
            client.query( query, (err, res) => {
                if( err ) {
                    error_callback( err );
                }
                else if(! res.rowCount ) {
                    if( no_rows_callback ) no_rows_callback();
                }
                else {
                    success_callback( res.rows );
                }
            });
        };

        if( client ) {
            main_callback( client );
        }
        else {
            this.pool.connect( (err, client, done) => {
                if( err ) throw err;
                main_callback( client );
            });
        }
    }


    private insert_address(
        client
        ,address: db_impl.USAddress
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

        let main_callback = (rows) => {
            success_callback( rows[0].id );
        };

        this.call_query(
            query
            ,main_callback
            ,null
            ,error_callback
            ,client
        );
    }

    private update_user_address(
        client
        ,member_id: string
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

        this.call_query(
            query
            ,success_no_rows_callback_builder( success_callback )
            ,no_rows_callback_builder( member_id, no_member_found_callback )
            ,error_callback
            ,client
        );
    }
}
