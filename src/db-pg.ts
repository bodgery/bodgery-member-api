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
        member: db_impl.Member
        ,success_callback: () => void
        ,error_callback: (err: Error) => void
    ): boolean
    {
        let add_tools = (id) => {
            return () => this.add_tools_to_member( id, member.approvedTools,
                success_callback, error_callback );
        };
        let add_questions = (id) => {
            return () => this.add_questions_to_member( id, member.profile,
                add_tools(id), error_callback );
        };
        let add_address = (id) => {
            this.add_address_to_member( id, member.address,
                add_questions(id), error_callback );
        };
        let add_member = () => {
            this.add_member_data( member,
                add_address,
                error_callback );
        };

        this.transaction( add_member, error_callback );
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

    end(): void
    {
        this.client.end();
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
                    ,",keyfob_id"
                    ,",full_name"
                    ,",phone"
                    ,",photo"
                ,") VALUES ($1, $2, $3, $4, $5, $6, $7 ) RETURNING id"
            ].join( " " )
            ,values: [
                member.firstName
                ,member.lastName
                ,"TRUE"
                ,member.id
                ,member.name
                ,member.phone
                ,member.photo
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

    private add_address_to_member(
        id: number
        ,addr: db_impl.USAddress
        ,success_callback: () => void
        ,error_callback: (err: Error) => void
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
                    ,",county"
                    ,",country"
                ,") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id"
            ].join( " " )
            ,values: [
                addr.address1
                ,addr.address2
                ,addr.city
                ,addr.state
                ,addr.zip
                ,addr.county
                ,addr.country
            ]
        };

        this.client.query( query, (err, res) => {
            if( err ) {
                error_callback( err );
            }
            else {
                let address_id = res.rows[0].id;
                this.update_addr_id( id, address_id, success_callback,
                    error_callback );
            }
        });
    }

    private update_addr_id(
        id: number
        ,address_id: number
        ,success_callback: () => void
        ,error_callback: (err: Error) => void
    ): void
    {
        let query = {
            name: "update-member-address"
            ,text: [
                "UPDATE members"
                    ,"SET address_id = $1"
                    ,"WHERE id = $2"
            ].join( " " )
            ,values: [
                address_id
                ,id
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
        member_id: number
        ,tools: Array<db_impl.Tool>
        ,success_callback: () => void
        ,error_callback: (err: Error) => void
    ): void
    {
        let next_placeholder = this.placeholder_generator();

        let query = {
            name: "insert-member-tool"
            ,text: [
                "INSERT INTO tool_training ("
                    ,"tool_id"
                    ,",member_id"
                ,") SELECT id, " + member_id
                ,"FROM tools WHERE name IN ("
                    ,tools.map( (_) => next_placeholder() ).join( ", " )
                ,")"
            ].join( " " )
            ,values: tools.map( (_) => _.id )
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

    private gather_approved_tools(
        members
        ,success_callback
        ,error_callback: ( err: Error ) => void
    ): void
    {
        let members_by_id: any = {};
        members.forEach( (_) => {
            let id = _.id;
            members_by_id[id] = _;
        });

        let placeholder = this.placeholder_generator();
        let query = {
            name: "gather-tool-training"
            ,text: [
                "SELECT"
                    ,"name"
                    ,"member_id"
                ,"FROM tool_training"
                ,"JOIN tools ON (tools.id = tool_training.tool_id)"
            ].join( " " )
            ,values: members_by_id.keys()
        };

        this.client.query( query, (err, res) => {
            if( err ) {
                error_callback( err );
            }
            else {
                res.rows.forEach( (_) => {
                    let tool_name = _.name;
                    let member_id = _.member_id;
                    members_by_id[member_id].approvedTools.push({
                        toolName: tool_name
                    });
                });
                success_callback( members_by_id.values() );
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
