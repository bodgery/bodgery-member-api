import * as assert from "assert";
import * as pg from "../src/db-pg";
import * as shortid from "shortid";
import {
    error_handler
    ,get_pg_connection
    ,test_member_data
} from "../src/util";


describe( 'Changes password data', function () {
    let db: pg.PG;

    before( () => {
        db = get_pg_connection();
    });

    it( 'Adds user, checks password, changes password', function (done) {
        let username = shortid.generate();
        let start_password = "foo123";
        let finish_password = "bar321";
        let salt = "1234";
        let crypt_type = "plaintext-test";

        let check_user_finish = () => {
            db.get_password_data_for_user(
                username
                ,(data) => {
                    assert.strictEqual( data.password, finish_password,
                        "Password changed" );
                    assert.strictEqual( data.salt, salt,
                        "Salt set" );
                    assert.strictEqual( data.crypt_type, crypt_type,
                        "Crypt type set" );
                    done();
                }
                ,() => error_handler( new Error(
                    "No user found when we should have"
                ) )
                ,error_handler
            );
        };

        let change_user_password = () => {
            db.set_password_data_for_user(
                username
                ,finish_password
                ,crypt_type
                ,salt
                ,check_user_finish
                ,() => error_handler( new Error(
                    "No user found when we should have"
                ) )
                ,error_handler
            );
        };

        let check_user_start = () => {
            db.get_password_data_for_user(
                username
                ,(data) => {
                    assert.strictEqual( data.password, start_password,
                        "Password set" );
                    assert.strictEqual( data.salt, salt,
                        "Salt set" );
                    assert.strictEqual( data.crypt_type, crypt_type,
                        "Crypt type set" );
                    change_user_password();
                }
                ,() => error_handler( new Error(
                    "No user found when we should have"
                ) )
                ,error_handler
            );
        };

        db.add_user(
            username
            ,start_password
            ,salt
            ,crypt_type
            ,check_user_start
            ,error_handler
        );
    });

    after( () => {
        db.end();
    });
});
