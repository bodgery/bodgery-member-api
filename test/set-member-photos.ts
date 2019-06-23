import * as assert from "assert";
import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as fs from "fs";
import * as mock_db from "../src/db-mock";

const PHOTO_DIR = "test_data/photos/";
const TEST_PHOTO = "test_data/bodgery_logo.jpg";


describe( 'PUT /v1/member/:member_id/photo', function () {
    before( () => {
        process.env['TEST_RUN'] = "1";
        let members = {
            "01": {
                photo: null
            }
        };

        let conf = server.default_conf();
        conf['photo_dir'] = PHOTO_DIR;

        let db = new mock_db.MockDB( [], members );
        server.start( db, conf );
    });

    it( 'Sets a member photo', function (done) {
        let check_photo = () => {
            request( server.SERVER )
                .get( "/api/v1/member/01/photo" )
                .send()
                .expect( 200 )
                .expect( function( res ) {
                    let data = res.body;
                    assert( data, "Got something back for photo" );
                })
                .end( function( err, res ) {
                    if( err ) done( err );
                    else done();
                });
        };

        fs.readFile( TEST_PHOTO, (err, data) => {
            if( err ) done(err);
            else {
                request( server.SERVER )
                    .put( '/api/v1/member/01/photo' )
                    .set( 'Content-Type', 'image/jpeg' )
                    .send( data.toString( 'binary' ) )
                    .expect( 204 )
                    .end( function( err, res ) {
                        if( err ) {
                            done(err);
                        }
                        else {
                            check_photo();
                        }
                    });
            }
        });
    });

    after( (done) => {
        server.stop();
        delete process.env['TEST_RUN'];

        // Just delete everything in the test photo dir
        fs.readdir( PHOTO_DIR, (err, files) => {
            let promises = files.map( (_) => new Promise( (resolve, reject) => {
                if( _.match( /^\./ ) ) {
                    // Ignore files beginning with a dot
                    resolve();
                }
                else {
                    fs.unlink( PHOTO_DIR + "/" + _, (err) => {
                        if( err ) reject( err );
                        else resolve();
                    });
                }
            }) );

            Promise.all( promises ).then( () => done() );
        });
    });
});
