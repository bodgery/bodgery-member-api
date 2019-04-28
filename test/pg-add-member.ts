import * as assert from "assert";
import * as db_impl from "../src/db";
import * as fs from "fs";
import * as pg from "../src/db-pg";
import * as shortid from "shortid";
import * as yaml from "js-yaml";


let error_handler = (err) => { throw err };


describe( 'Create member in PostgreSQL', function () {
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

    it( 'Adds a member to database', function (done) {
        let fetch_member = (member_id) => {
            db.get_member( member_id
                ,(member) => {
                    assert.strictEqual( member.firstName, "Foo",
                        "Fetched member" );
                    done();
                }
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
            ,fetch_member
            ,error_handler
        );
    });

    after( () => {
        db.end();
    });
});
