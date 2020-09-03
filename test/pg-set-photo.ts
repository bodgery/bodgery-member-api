import * as assert from 'assert';
import * as pg from '../src/db-pg';
import * as shortid from 'shortid';
import {error_handler, get_pg_connection, test_member_data} from '../src/util';

const PHOTO_PATH = 'foobar';

describe("Changes a member's photo", function () {
    let db: pg.PG;

    before(() => {
        db = get_pg_connection();
    });

    it('Adds member, sets photo, checks photo', function (done) {
        let check_photo_finish = member_id => {
            db.get_member_photo(
                member_id,
                path => {
                    assert.strictEqual(path, PHOTO_PATH, 'Photo path set');
                    done();
                },
                () =>
                    error_handler(
                        new Error('Could not find member ID: ' + member_id),
                    ),
                error_handler,
            );
        };

        let set_new_photo = member_id => {
            db.set_member_photo(
                member_id,
                PHOTO_PATH,
                () => {
                    check_photo_finish(member_id);
                },
                () =>
                    error_handler(
                        new Error('Could not find member ID: ' + member_id),
                    ),
                error_handler,
            );
        };

        db.add_member(test_member_data(), set_new_photo, error_handler);
    });

    after(() => {
        db.end();
    });
});
