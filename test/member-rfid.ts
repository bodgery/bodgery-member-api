import * as assert from "assert";
import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";


describe( 'RFID management', function () {
    let good_rfid = "0001234567";
    let invalid_rfid = "0007654321";
    let inactive_rfid = "1234567000";


    before( () => {
        let members = {
            "01": {
                is_active: true
                ,rfid: null
            }
            ,"02": {
                is_active: false
                ,rfid: inactive_rfid
            }
        };
        let db = new mock_db.MockDB( members, {} );
        server.start( db );
    });

    it( 'Sets an RFID on a valid member', function (done) {
        let fetch_status = () => {
            request( server.SERVER )
                .get( '/api/v1/rfid/' + good_rfid )
                .send()
                .expect( 200 )
                .end( function( err, res ) {
                    if( err ) done(err);
                    else done();
                });
        };

        request( server.SERVER )
            .put( '/api/v1/member/01/rfid' )
            .send({ rfid: good_rfid })
            .expect( 200 )
            .end( function( err, res ) {
                if( err ) done(err);
                else fetch_status();
            });
    });

    it( 'Tries to fetch a member that doesn\'t exist', function (done) {
        request( server.SERVER )
            .get( '/api/v1/rfid/' + invalid_rfid )
            .send()
            .expect( 404 )
            .end( function( err, res ) {
                if( err ) done(err);
                else done();
            });
    });

    it( 'Tries to fetch an inactive member', function (done) {
        request( server.SERVER )
            .get( '/api/v1/rfid/' + inactive_rfid )
            .send()
            .expect( 403 )
            .end( function( err, res ) {
                if( err ) done(err);
                else done();
            });
    });

    after( () => {
        server.stop();
    });
});
