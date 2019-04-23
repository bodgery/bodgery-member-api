import * as assert from "assert";
import * as bcrypt from "../src/password/bcrypt";
import * as mock_db from "../src/db-mock";
import * as passwd from "../src/password";


describe( "Check a password encrypted with bcrypt", function () {
    let checker: passwd.Checker;
    let good_password = "foobar123";
    let bad_password = "barfoo123";
    let checker_str = "bcrypt_10";

    before( () => {
        let crypter = new bcrypt.BCrypt( ["10"] );
        let crypted_good_passwd = crypter.crypt( good_password );
        let db = new mock_db.MockDB( null, {
            "test@example.com": {
                password: crypted_good_passwd
                ,crypt_type: checker_str
            }
        });
        checker = new passwd.Checker( checker_str, db );
    });

    it( "Checks good password with bcrypt", function (done) {
        checker.isMatch({
            username: "test@example.com"
            ,passwd: good_password
            ,is_match_callback: () => {
                assert( true, "Password matched" );
                done();
            }
            ,is_not_match_callback: () => {
                assert( false, "Password matched" );
                done();
            }
        });
    });
    it( "Checks bad password with bcrypt", function (done) {
        checker.isMatch({
            username: "test@example.com"
            ,passwd: bad_password
            ,is_match_callback: () => {
                assert( false, "Password not matched" );
                done();
            }
            ,is_not_match_callback: () => {
                assert( true, "Password not matched" );
                done();
            }
        });
    });
});
