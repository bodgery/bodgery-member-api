import * as assert from "assert";
import * as pg from "../src/db-pg";
import * as shortid from "shortid";
import {
    error_handler
    ,get_pg_connection
    ,test_member_data
} from "../src/util";


describe( 'Dumps all RFIDs', function () {
    let db: pg.PG;

    before( () => {
        db = get_pg_connection();
    });

    it( 'dumps the RFID database', function (done) {
        let start_rfid = shortid.generate();

        let check_rfid_dump = () => {
            db.rfid_dump(
                ( dump ) => {
                    assert( dump[start_rfid], "RFID found"
                        + " (" + start_rfid + ")" );
                    done();
                }
                ,error_handler
            );
        };

        let activate_member = (member_id) => {
            db.set_member_is_active(
                member_id
                ,true
                ,() => check_rfid_dump()
                ,error_handler
                ,error_handler
            );
        };

        db.add_member(
            test_member_data( start_rfid )
            ,activate_member
            ,error_handler
        );
    });

    after( () => {
        db.end();
    });
});
