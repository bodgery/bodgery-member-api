import * as assert from 'assert';
import * as pg from '../src/db-pg';
import * as shortid from 'shortid';
import {error_handler, get_pg_connection, test_member_data} from '../src/util';

describe('Fetch all members', function () {
    let db: pg.PG;

    before(() => {
        db = get_pg_connection();
    });

    it('fetches members', function (done) {
        let start_rfid = shortid.generate();

        let run_get_members = member_id => {
            db.get_members(
                0,
                10,
                members => {
                    assert(members.length > 0, 'Fetched members');
                    assert(members.length <= 10, "Didn't get too many members");
                    done();
                },
                error_handler,
            );
        };

        // If this is a new run, ensure there is at least one member in there
        db.add_member(
            test_member_data(start_rfid),
            run_get_members,
            error_handler,
        );
    });

    after(() => {
        db.end();
    });
});
