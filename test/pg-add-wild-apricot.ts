import * as assert from 'assert';
import * as pg from '../src/db-pg';
import * as shortid from 'shortid';
import {error_handler, get_pg_connection, test_member_data} from '../src/util';

describe('Set Wild Apricot ID in PostgreSQL', function () {
    let db: pg.PG;

    before(() => {
        db = get_pg_connection();
    });

    it('Sets Wild Apricot ID on user', function (done) {
        let id = shortid.generate();

        let fetch_wa = member_id => {
            db.get_member_wild_apricot(
                member_id,
                wild_apricot_id => {
                    assert.strictEqual(
                        wild_apricot_id,
                        id,
                        'Fetched member wild apricot ID',
                    );
                    done();
                },
                () => error_handler(new Error('No member found')),
                error_handler,
            );
        };

        let set_wa = member_id => {
            db.put_member_wild_apricot(
                member_id,
                id,
                () => fetch_wa(member_id),
                () => error_handler(new Error('No member found')),
                error_handler,
            );
        };

        db.add_member(test_member_data(), set_wa, error_handler);
    });

    after(() => {
        db.end();
    });
});
