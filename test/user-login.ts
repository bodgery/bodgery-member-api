import * as assert from "assert";
import * as request from "supertest";
import * as server from "../app";
import * as bcrypt from "../src/password/bcrypt";
import * as mock_db from "../src/db-mock";
import * as passwd from "../src/password";


describe( "User login", function () {
    let db: mock_db.MockDB;
    let good_username = "test@example.com";
    let good_password = "foobar123";
    let bad_username = "foo@example.com";
    let bad_password = "barfoo123";
    let checker_str = "terribadplaintext";


    before( () => {
        let conf = server.default_conf();
        conf['preferred_password_crypt_method'] = checker_str;

        let user_data: any = {};
        user_data[good_username] = {
            password: good_password
            ,crypt_type: checker_str
        };

        db = new mock_db.MockDB( null, user_data );

        server.start( db, conf );
    });

    it( "Logs a user in", function (done) {
        let check_final_logged_out, logout, check_is_logged_in, login;
        let cookie;

        let start = () => {
            request( server.SERVER )
                .get( '/user/is-logged-in' )
                .expect( 403 )
                .end( (err, res) => {
                    if(err) throw err;
                    login();
                });
        };

        login = () => {
            request( server.SERVER )
                .put( '/user/login' )
                .send({
                    username: good_username
                    ,password: good_password
                })
                .expect( 200 )
                .expect( 'set-cookie', /=/ )
                .end( (err, res) => {
                    if(err) throw err;
                    cookie = res.header['set-cookie'];
                    check_is_logged_in();
                });
        };

        check_is_logged_in = () => {
            let req = request( server.SERVER )
                .get( '/user/is-logged-in' )
                .set( 'Cookie', cookie )
                .send()
                .expect( 200 )
                .end( (err, res) => {
                    if(err) throw err;
                    assert.strictEqual( res.body.username, good_username
                        ,"Returned username" );
                    logout();
                });
        };

        logout = () => {
            let req = request( server.SERVER )
                .put( '/user/logout' )
                .set( 'Cookie', cookie )
                .send()
                .expect( 200 )
                .end( (err, res) => {
                    if(err) throw err;
                    check_final_logged_out();
                });
        };

        check_final_logged_out = () => {
            let req = request( server.SERVER )
                .get( '/user/is-logged-in' )
                .set( 'Cookie', cookie )
                .send()
                .expect( 403 )
                .end( (err, res) => {
                    if(err) throw err;
                    done();
                });
        };

        start();
    });

    it( "Logs in with bad user", function (done) {
        request( server.SERVER )
            .put( '/user/login' )
            .send({
                username: bad_username
                ,password: good_password
            })
            .expect( 403 )
            .end( (err, res) => {
                if(err) throw err;
                done();
            });
    });

    it( "Logs in with bad password", function (done) {
        request( server.SERVER )
            .put( '/user/login' )
            .send({
                username: good_username
                ,password: bad_password
            })
            .expect( 403 )
            .end( (err, res) => {
                if(err) throw err;
                done();
            });
    });


    after( () => {
        server.stop();
    });
});
