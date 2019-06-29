import * as assert from "assert";
import * as pg from "../src/db-pg";
import {
    error_handler
    ,get_pg_connection
    ,test_member_data
} from "../src/util";


describe( 'Changes member status setting', function () {
    let db: pg.PG;

    before( () => {
        db = get_pg_connection();
    });

    it( 'Flips member from active to inactive and back again', function (done) {
        // We could shorten the change_status_active()/change_status_inactive()
        // etc. pairs by going deeper into abstract functions, but I think it's
        // easier to read and follow if we break it out this way.
        let final_check_status_inactive = (member_id) => {
            db.get_member_is_active(
                member_id
                ,(is_active) => {
                    assert(! is_active, "Member flipped back to inactive" );
                    done();
                }
                ,error_handler
                ,error_handler
            );
        };

        let change_status_inactive = (member_id) => {
            db.set_member_is_active(
                member_id
                ,false
                ,() => final_check_status_inactive(member_id)
                ,error_handler
                ,error_handler
            );
        };

        let check_status_active = (member_id) => {
            db.get_member_is_active(
                member_id
                ,(is_active) => {
                    assert( is_active, "Member changed to active" );
                    change_status_inactive( member_id );
                }
                ,error_handler
                ,error_handler
            );
        };

        let change_status_active = (member_id) => {
            db.set_member_is_active(
                member_id
                ,true
                ,() => check_status_active(member_id)
                ,error_handler
                ,error_handler
            );
        };

        let check_status_inactive = (member_id) => {
            db.get_member_is_active(
                member_id
                ,(is_active) => {
                    assert(! is_active, "Member starts as inactive" );
                    change_status_active( member_id );
                }
                ,error_handler
                ,error_handler
            );
        };

        db.add_member(
            test_member_data()
            ,check_status_inactive
            ,error_handler
        );
    });

    after( () => {
        db.end();
    });
});
