import * as assert from "assert";
import * as pg from "../src/db-pg";
import * as shortid from "shortid";
import {
    error_handler
    ,get_pg_connection
    ,test_member_data
} from "../src/util";


describe( 'Changes a member\'s RFID', function () {
    let db: pg.PG;

    before( () => {
        db = get_pg_connection();
    });

    it( 'Adds member, checks RFID, changes RFID', function (done) {
        let start_rfid = shortid.generate();
        let change_rfid = shortid.generate();

        let check_old_rfid = (member_id) => {
            db.get_member_rfid(
                start_rfid
                ,() => {
                    assert( false, "Old RFID should no longer exist" );
                    done();
                }
                ,() => {
                    assert( false, "Old RFID should no longer exist" );
                    done();
                }
                ,() => {
                    assert( true, "Old RFID should no longer exist" );
                    done();
                }
                ,error_handler
            );
        };

        let check_rfid_finish = (member_id) => {
            db.get_member_rfid(
                change_rfid
                ,() => {
                    throw new Error( "RFID active, when it shouldn't be" );
                    check_old_rfid( member_id );
                }
                ,() => { 
                    assert( true, "RFID was changed" );
                }
                ,() => {
                    throw new Error( "RFID was not found, when it should be" )
                }
                ,error_handler
            );
        };

        let set_new_rfid = (member_id) => {
            db.set_member_rfid(
                member_id
                ,change_rfid
                ,() => {
                    check_rfid_finish( member_id );
                }
                ,() => error_handler(
                    new Error( "Could not find member ID: " + member_id )
                )
                ,error_handler
            );
        };

        let check_rfid_start = (member_id) => {
            db.get_member_rfid(
                start_rfid
                ,() => {
                    throw new Error( "RFID " + start_rfid + " was active" );
                    set_new_rfid( member_id );
                }
                ,() => {
                    assert( true, "RFID is inactive to start with" );
                    done();
                }
                ,() => {
                    throw new Error( "RFID " + start_rfid + " was not found" );
                    done();
                }
                ,error_handler
            );
        };

        db.add_member(
            test_member_data( start_rfid )
            ,check_rfid_start
            ,error_handler
        );
    });

    after( () => {
        db.end();
    });
});
