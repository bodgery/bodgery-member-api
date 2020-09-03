import * as assert from 'assert';
import * as plaintext from '../src/password/plaintext';
import * as mock_db from '../src/db-mock';
import * as passwd from '../src/password';

describe('Add new user', function () {
    let checker: passwd.Checker;
    let user = 'test@example.com';
    let pass = 'foobar123';
    let checker_str = 'terribadplaintext';

    before(done => {
        let db = new mock_db.MockDB(null, {});
        checker = new passwd.Checker(checker_str, db);
        done();
    });

    it('adds a new user and checks for successful match', function (done) {
        checker.addNewUser(
            user,
            pass,
            () => {
                checker.isMatch({
                    username: user,
                    passwd: pass,
                    is_match_callback: () => {
                        assert(true, 'Password matched');
                        done();
                    },
                    is_not_match_callback: () => {
                        assert(false, 'Password matched');
                        done();
                    },
                });
            },
            err => done(err),
        );
    });
});
