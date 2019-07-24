import * as assert from "assert";
import * as pg from "../src/db-pg";
import * as shortid from "shortid";
import {
    error_handler
    ,get_pg_connection
    ,test_member_data
} from "../src/util";


describe( 'Logs an RFID entry', function () {
    let db: pg.PG;

    before( () => {
        db = get_pg_connection();
    });

    it( 'Logs an RFID entry', function (done) {
        let rfid = shortid.generate();

        db.add_member(
            test_member_data( rfid )
            ,(member_id) => {
                db.log_rfid_entry(
                    rfid
                    ,true
                    ,() => {
                        assert( true, "Logged entry" );
                        done();
                    }
                    ,error_handler
                );

            }
            ,error_handler
        );

    });

    it( 'Fetches RFID logs', function (done) {
        db.get_rfid_log( 0, 10
            ,(logs) => {
                assert( logs.length, "Fetched RFID log" );
                assert( logs.length <= 10, "Didn't get too many" );
                done();
            }
            ,error_handler
        );
    });

    after( () => {
        db.end();
    });
});
