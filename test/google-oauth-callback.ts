import * as assert from "assert";
import * as fs from "fs";
import * as request from "supertest";
import * as server from "../app";


describe( 'GET /v1/google_oauth', function () {
    let token_file = 'tmp-google-token';
    before( () => {
        let conf = server.default_conf();
        conf['google_oauth_token_path'] = token_file;
        server.start( null, conf );
    });

    // Disabiling this test, as the key is being fetched by another method
    /*
    it( 'Sets a token for the google oauth callback', function (done) {
        let token_code = "xyz123";

        request( server.SERVER )
            .get( '/api/v1/google_oauth?code=' + token_code )
            .send()
            .expect( 200 )
            .end( function( err, res ) {
                if( err ) {
                    done(err);
                }
                else {
                    fs.readFile( token_file, ( err, got_token ) => {
                        if( err ) {
                            done(err);
                        }
                        else {
                            assert.equal( got_token, token_code );
                            done();
                        }
                    });
                }
            });
    });
    */

    after( (done) => {
        server.stop();

        fs.unlink( token_file, (err) => {
            // Ignore any error, we're just finished
            done();
        });
    });
});