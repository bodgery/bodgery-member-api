import * as assert from "assert";
import * as db_impl from "../src/db";
import * as fs from "fs";
import * as pg from "../src/db-pg";
import * as shortid from "shortid";
import * as yaml from "js-yaml";


let error_handler = (err) => { throw err };


describe( 'Create address in PostgreSQL', function () {
    let db: pg.PG;

    before( () => {
        var conf = yaml.safeLoad(
            fs.readFileSync( './config.yaml', 'utf8' ),
            {
                filename: "./config.yaml"
            }
        );
        db = new pg.PG(
            conf.db_host
            ,conf.db_port
            ,conf.db_name
            ,conf.db_user
            ,conf.db_password
        );
    });

    it( 'Creates address, sets on user', function (done) {
        let fetch_address = (member_id) => {
            db.get_member_address(
                member_id
                ,(addr) => {
                    assert.strictEqual( addr.state, "WI",
                        "Fetched member address" );
                    done();
                }
                ,error_handler
                ,error_handler
            );
        };

        let set_address = (member_id) => {
            db.put_member_address(
                member_id
                ,{
                    address1: "123 Main St"
                    ,city: "Madison"
                    ,state: "WI"
                    ,zip: "53711"
                }
                ,() => fetch_address( member_id )
                ,error_handler
                ,error_handler
            );
        };

        db.add_member(
            {
                rfid: shortid.generate()
                ,firstName: "Foo"
                ,lastName: "Bar"
                ,phone: "555 123 4567"
                ,email: "foo@example.com"
                ,photo: "file:///dev/null"
            }
            ,set_address
            ,error_handler
        );
    });

    after( () => {
        db.end();
    });
});
