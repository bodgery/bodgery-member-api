import * as assert from "assert";
import * as pg from "../src/db-pg";
import {
    error_handler
    ,get_pg_connection
    ,test_member_data
} from "../src/util";


describe( 'Create member in PostgreSQL', function () {
    let db: pg.PG;

    before( () => {
        db = get_pg_connection();
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
            test_member_data()
            ,fetch_member
            ,error_handler
        );
    });

    after( () => {
        db.end();
    });
});
