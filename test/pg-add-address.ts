import * as assert from 'assert';
import * as pg from '../src/db-pg';
import {error_handler, get_pg_connection, test_member_data} from '../src/util';

describe('Create address in PostgreSQL', function () {
    let db: pg.PG;

    before(() => {
        db = get_pg_connection();
    });

    it('Creates address, sets on user', function (done) {
        let fetch_address = member_id => {
            db.get_member_address(
                member_id,
                addr => {
                    assert.strictEqual(
                        addr.state,
                        'WI',
                        'Fetched member address',
                    );
                    done();
                },
                error_handler,
                error_handler,
            );
        };

        let set_address = member_id => {
            db.put_member_address(
                member_id,
                {
                    address1: '123 Main St',
                    city: 'Madison',
                    state: 'WI',
                    zip: '53711',
                },
                () => fetch_address(member_id),
                error_handler,
                error_handler,
            );
        };

        db.add_member(test_member_data(), set_address, error_handler);
    });

    after(() => {
        db.end();
    });
});
