import * as assert from 'assert';
import * as pg from '../src/db-pg';
import * as shortid from 'shortid';
import {
    error_handler,
    get_pg_connection,
    test_member_data,
    make_secure_token,
} from '../src/util';

describe('Create token in PostgreSQL', function () {
    let db: pg.PG;
    let token = make_secure_token();
    let username = shortid.generate();

    before(() => {
        db = get_pg_connection();
    });

    it('Adds a token to database', function (done) {
        let check_token = () => {
            db.is_token_allowed(
                token,
                () => {
                    assert(true, 'Token is allowed through');
                    done();
                },
                () => {
                    done(new Error('token was not allowed'));
                },
                error_handler,
            );
        };

        let create_token = () => {
            db.add_token(
                username,
                token,
                '',
                '',
                () => {
                    assert(true, 'Token created');
                    check_token();
                },
                () => {
                    done(new Error('User ' + username + ' was not found'));
                },
                error_handler,
            );
        };

        let create_user = () => {
            db.add_user(
                username,
                'Foobar123',
                '1234',
                'plaintext-test',
                create_token,
                error_handler,
            );
        };

        db.is_token_allowed(
            token,
            () => {
                assert(false, "Token was allowed through, but shouldn't");
                done();
            },
            () => {
                assert(true, 'Token was not allowed, correctly');
                create_user();
            },
            error_handler,
        );
    });

    after(() => {
        db.end();
    });
});
