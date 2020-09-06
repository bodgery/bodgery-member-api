import * as assert from "assert";
import * as request from "supertest";
import * as sinon from "sinon";
import * as server from "../app";
import * as bcrypt from "../src/password/bcrypt";
import * as mock_db from "../src/db-mock";
import * as passwd from "../src/password";
import UserRepositoryStub from "./__mocks__/user_repository";


describe( "User login", function () {
    let app;
    let db: mock_db.MockDB;
    let good_username = "test@example.com";
    let good_password = "foobar123";
    let bad_username = "foo@example.com";
    let bad_password = "barfoo123";
    let checker_str = "terribadplaintext";

    // Since session cookie is HTTPS-only, need to put this header in to make
    // server think we're coming from the frontend proxy
    let trust_header_name = 'X-Forwarded-Proto';
    let trust_header_value = 'https';

    beforeEach( async function() {
        let conf = server.default_conf();
        conf['preferred_password_crypt_method'] = checker_str;

        let user_data: any = {};
        user_data[good_username] = {
            password: good_password
            ,crypt_type: checker_str
        };

        db = new mock_db.MockDB( null, user_data );

        UserRepositoryStub().addUser({
            email: good_username,
            password: good_password,
        })

        app = await server.createApp(this.connection, db, conf );
    });

    it( "Logs a user in", function (done) {
        let check_final_logged_out, logout, check_is_logged_in, login;
        let cookie;

        let start = () => {
            request( app )
                .get( '/user/is-logged-in' )
                .set( trust_header_name, trust_header_value )
                .expect( 403 )
                .end( (err, res) => {
                    if(err) throw err;
                    login();
                });
        };

        login = () => {
            request( app )
                .post( '/user/login' )
                .set( trust_header_name, trust_header_value )
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
            let req = request( app )
                .get( '/user/is-logged-in' )
                .set( trust_header_name, trust_header_value )
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
            let req = request( app )
                .post( '/user/logout' )
                .set( trust_header_name, trust_header_value )
                .set( 'Cookie', cookie )
                .send()
                .expect( 200 )
                .end( (err, res) => {
                    if(err) throw err;
                    check_final_logged_out();
                });
        };

        check_final_logged_out = () => {
            let req = request( app )
                .get( '/user/is-logged-in' )
                .set( trust_header_name, trust_header_value )
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

        request( app )
            .post( '/user/login' )
            .set( trust_header_name, trust_header_value )
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
        request( app )
            .post( '/user/login' )
            .set( trust_header_name, trust_header_value )
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

    afterEach(() => sinon.restore());
});
