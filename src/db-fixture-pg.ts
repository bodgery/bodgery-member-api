import * as pg_db from "./db-pg";
import * as shortid from "shortid";


export class PGFixture
{
    tool1ID: number = null;
    tool1Name: string = null;
    tool2ID: number = null;
    tool2Name: string = null;


    constructor()
    {
    }


    public addToDB(
        db_frontend: pg_db.PG
        ,success_callback: () => void
    ): void
    {
        let db = db_frontend.client;

        let tool2_callback = (tool_id, tool_name, area_id, member_id) => {
            this.tool2ID = tool_id;
            this.tool2Name = tool_name;
            success_callback();
        };
        let tool1_callback = (tool_id, tool_name, area_id, member_id) => {
            this.tool1ID = tool_id;
            this.tool1Name = tool_name;
            this.addTool( db, area_id, member_id,
                (tool2_id, tool2_name) => tool2_callback(
                    tool2_id, tool2_name, area_id, member_id )
            );
        };
        let member_callback = (member_id, area_id) => {
            this.addTool( db, area_id, member_id,
                (tool1_id, tool1_name) => tool1_callback(
                    tool1_id, tool1_name, area_id, member_id )
            );
        };
        let area_callback = (area_id) => {
            this.addMember( db,
                (member_id) => member_callback( member_id, area_id ) );
        };

        this.addArea( db, area_callback );
    }


    private addArea(
        db
        ,success_callback: ( area_id: number ) => void
    ): void
    {
        db.query({
            text: [
                "INSERT INTO areas ("
                    ,"area_name"
                ,") VALUES ($1) RETURNING id"
            ].join( " " )
            ,values: [
                "test_area"
            ]
        }, (err, res) => {
            if( err ) {
                throw new Error( "Error inserting new area into database: "
                    + err.toString() );
            }
            else {
                success_callback( res.rows[0].id );
            }
        });
    }

    private addMember(
        db
        ,success_callback: ( member_id: number ) => void
    ): void
    {
        db.query({
            text: [
                "INSERT INTO members ("
                    ,"full_name"
                ,") VALUES ($1) RETURNING id"
            ].join( " " )
            ,values: [
                "Test Member"
            ]
        }, (err, res) => {
            if( err ) {
                throw new Error( "Error inserting new member into database: "
                    + err.toString() );
            }
            else {
                success_callback( res.rows[0].id );
            }
        });
    }

    private addTool(
        db
        ,area_id: number
        ,owner_id: number
        ,success_callback: ( tool_id: number, tool_name: string ) => void
    ): void
    {
        let tool_name = shortid.generate();

        db.query({
            text: [
                "INSERT INTO tools ("
                    ,"name"
                    ,",area_id"
                    ,",color"
                    ,",owner_id"
                ,") VALUES ( $1, $2, $3, $4 ) RETURNING id"
            ].join( " " )
            ,values: [
                tool_name
                ,area_id
                ,"green"
                ,owner_id
            ]
        }, (err, res) => {
            if( err ) {
                throw new Error( "Error inserting new tool into database: "
                    + err.toString() );
            }
            else {
                success_callback( res.rows[0].id, tool_name );
            }
        });
    }
}
