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
        ,success_callback: () => void
        ,error_callback: (err: Error) => void
    ): boolean
    {
        let add_member = () => {
            this.add_member_data( member,
                success_callback,
                error_callback );
        };

        this.transaction( add_member, error_callback );
        return true;
    }

    get_member(
        member_id: string
        ,success_callback: ( member: db_impl.SimpleMember ) => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean
    {
        // TODO
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
        // TODO
        return true;
    }

    get_member_address(
        member_id: string
        ,success_callback: ( address: db_impl.USAddress ) => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean
    {
        // TODO
        return true;
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


    private add_member_data(
        member: db_impl.SimpleMember
        ,success_callback: (id: number) => void
        ,error_callback: (err: Error) => void
    ): void
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
                ,") VALUES ($1, $2, $3, $4 ) RETURNING id"
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
                success_callback( res.rows[0].id );
            }
        });
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
}
