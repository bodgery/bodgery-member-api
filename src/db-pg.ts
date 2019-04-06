import * as pg from "pg";
import * as pg_escape from "pg-escape";
import * as db_impl from "./db";


export class PG
{
    private client: any;


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
        member: db_impl.Member
        ,success_callback: () => void
        ,error_callback: (err: Error) => void
    ): boolean
    {
        this.transaction( () => {
            this.add_member_data( member
                ,(id) => {
                    this.add_questions_to_member( id, member.profile, () => {
                        this.add_tools_to_member( id, member.approvedTools,
                            success_callback, error_callback );
                    }, error_callback );
                }
                ,error_callback
            );
        }, error_callback );

        return true;
    }

    get_members(
        success_callback: ( members: Array<db_impl.Member> ) => void
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
                ,"keyfob_id AS id"
                ,",first_name"
                ,",last_name"
                ,",full_name AS name"
                ,",city"
                ,",zip"
                ,",photo"
            ,"FROM members"
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
                success_callback( res.rows );
            }
        });
        return true;
    }

    end(): void
    {
        this.client.end;
    }


    private add_member_data(
        member: db_impl.Member
        ,success_callback: (id: number) => void
        ,error_callback: (err: Error) => void
    ): void
    {
        let query = {
            name: "add-member"
            ,text: [
                "INSERT INTO members ("
                    ,"first_name"
                    ,",last_name"
                    ,",status"
                    ,",city"
                    ,",zip"
                    ,",keyfob_id"
                    ,",full_name"
                ,") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id"
            ].join( " " )
            ,values: [
                member.firstName
                ,member.lastName
                ,"TRUE"
                ,member.address.city
                ,member.address.zip
                ,member.id
                ,member.name
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

    private add_questions_to_member(
        id: number
        ,questions: Array<db_impl.Question>
        ,success_callback: () => void
        ,error_callback: (err: Error) => void
    ): void
    {
        // TODO there is no place for questions in current schema
        success_callback();
    }

    private add_tools_to_member(
        id: number
        ,tools: Array<db_impl.Tool>
        ,success_callback: () => void
        ,error_callback: (err: Error) => void
    ): void
    {
        // TODO
        success_callback();
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
