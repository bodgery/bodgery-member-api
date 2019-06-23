import * as assert from "assert";
import * as request from "supertest";
import * as server from "../app";
import * as mock_db from "../src/db-mock";
import * as passwd from "../src/password";


describe( "User authorization", function () {
    let db: mock_db.MockDB;
    let username = "test@example.com";
    let password = "foobar123";
    let checker_str = "terribadplaintext";

    // Since session cookie is HTTPS-only, need to put this header in to make
    // server think we're coming from the frontend proxy
    let trust_header_name = 'X-Forwarded-Proto';
    let trust_header_value = 'https';


    before( () => {
        let conf = server.default_conf();
        conf['preferred_password_crypt_method'] = checker_str;

        let user_data: any = {};
        user_data[username] = {
            password: password
            ,crypt_type: checker_str
        };

        db = new mock_db.MockDB( null, user_data );

        server.start( db, conf );
    });


    it( 'Tries to access a secure page without logging in', (done) => {
        request( server.SERVER )
            .get( '/members/pending' )
            .set( trust_header_name, trust_header_value )
            .expect( 403 )
            .end( (err, res) => {
                if(err) done(err);
                else done();
            });
    });

    it( 'Logs in, then tries to access a secure page', (done) => {
        let access_pending;
        let cookie;

        let start = () => {
            request( server.SERVER )
                .post( '/user/login' )
                .set( trust_header_name, trust_header_value )
                .send({
                    username: username
                    ,password: password
                })
                .expect( 200 )
                .expect( 'set-cookie', /=/ )
                .end( (err, res) => {
                    if(err) throw err;
                    cookie = res.header['set-cookie'];
                    access_pending()
                });
        };

        access_pending = () => {
            request( server.SERVER )
                .get( '/members/pending' )
                .set( trust_header_name, trust_header_value )
                .set( 'Cookie', cookie )
                .expect( 200 )
                .end( (err, res) => {
                    if(err) done(err);
                    else done();
                });
        };

        start();
    });

    after( () => {
        server.stop();
    });
});
