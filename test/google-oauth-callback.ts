import * as assert from "assert";
import * as fs from "fs";
import * as request from "supertest";
import * as server from "../app";


describe( 'GET /v1/google_oauth', function () {
    let app;

    let token_file = 'tmp-google-token';
    before( async () => {
        let conf = server.default_conf();
        conf['google_oauth_token_path'] = token_file;
        app = await server.createApp(this.connection, null, conf );
    });

    // Disabiling this test, as the key is being fetched by another method
    /*
    it( 'Sets a token for the google oauth callback', function (done) {
        let token_code = "xyz123";

        request( app )
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

    after( () => {
        return new Promise( (resolve, reject) => {
            fs.unlink( token_file, (err) => {
                // Ignore any error, we're just finished
                resolve();
            });
        });
    });
});
