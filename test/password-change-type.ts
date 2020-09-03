import * as assert from 'assert';
import * as scrypt from '../src/password/scrypt';
import * as db from '../src/db';
import * as mock_db from '../src/db-mock';
import * as passwd from '../src/password';

describe('Password crypt type changes on the fly', function () {
    let checker: passwd.Checker;
    let good_password = 'foobar123';
    let checker_str = 'bcrypt_10';
    let stored_checker_str = 'scrypt_16384_8_1';
    let db: db.DB;

    before(done => {
        let crypter = new scrypt.SCrypt(['16384', '8', '1']);
        let salt = passwd.make_salt();
        let crypted_good_passwd = crypter.crypt(
            good_password,
            salt,
            crypted_good_passwd => {
                db = new mock_db.MockDB(null, {
                    'test@example.com': {
                        password: crypted_good_passwd,
                        crypt_type: stored_checker_str,
                        salt: salt.toString('hex'),
                    },
                });
                checker = new passwd.Checker(checker_str, db);
                done();
            },
        );
    });

    it('Checks password with scrypt, rencrypts with bcrypt', function (done) {
        checker.isMatch({
            username: 'test@example.com',
            passwd: good_password,
            is_match_callback: () => {
                assert(true, 'Password matched');

                db.get_password_data_for_user(
                    'test@example.com',
                    stored_data => {
                        assert.strictEqual(
                            stored_data.crypt_type,
                            checker_str,
                            'Crypt type was correctly changed',
                        );

                        checker.isMatch({
                            username: 'test@example.com',
                            passwd: good_password,
                            is_match_callback: () => {
                                assert(
                                    true,
                                    'Password still matched after change',
                                );
                                done();
                            },
                            is_not_match_callback: () => {
                                assert(
                                    false,
                                    'Password did not match after change',
                                );
                                done();
                            },
                        });
                    },
                    () => {
                        assert(false, "Somehow, user wasn't found?");
                        done();
                    },
                    err => {
                        throw err;
                        done();
                    },
                );
            },
            is_not_match_callback: () => {
                assert(false, 'Password matched');
                done();
            },
        });
    });
});
