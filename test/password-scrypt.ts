import * as assert from 'assert';
import * as scrypt from '../src/password/scrypt';
import * as mock_db from '../src/db-mock';
import * as passwd from '../src/password';

describe('Check a password encrypted with scrypt', function () {
    let checker: passwd.Checker;
    let good_password = 'foobar123';
    let bad_password = 'barfoo123';
    let checker_str = 'scrypt_16384_8_1';

    before(done => {
        let crypter = new scrypt.SCrypt(['16384', '8', '1']);
        let salt = passwd.make_salt();

        crypter.crypt(good_password, salt, crypted_good_passwd => {
            let db = new mock_db.MockDB(null, {
                'test@example.com': {
                    password: crypted_good_passwd,
                    crypt_type: checker_str,
                    salt: salt.toString('hex'),
                },
            });
            checker = new passwd.Checker(checker_str, db);
            done();
        });
    });

    it('Checks good password with scrypt', function (done) {
        checker.isMatch({
            username: 'test@example.com',
            passwd: good_password,
            is_match_callback: () => {
                assert(true, 'Password matched');
                done();
            },
            is_not_match_callback: () => {
                assert(false, 'Password matched');
                done();
            },
        });
    });
    it('Checks bad password with scrypt', function (done) {
        checker.isMatch({
            username: 'test@example.com',
            passwd: bad_password,
            is_match_callback: () => {
                assert(false, 'Password not matched');
                done();
            },
            is_not_match_callback: () => {
                assert(true, 'Password not matched');
                done();
            },
        });
    });
});
