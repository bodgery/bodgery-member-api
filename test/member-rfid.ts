import * as assert from "assert";
import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";

const uuid1 = "0662df8c-e43a-4e90-8b03-3849afbb533e";
const uuid2 = "c28ec74e-2459-488e-9aec-f6068e8a08a7";


describe( 'RFID management', function () {
    let app;

    let good_rfid = "0001234567";
    let invalid_rfid = "0007654321";
    let inactive_rfid = "1234567000";


    beforeEach( async function() {
        let members = {};
        members[uuid1] = {
            is_active: true
            ,rfid: null
        };
        members[uuid2] = {
            is_active: false
            ,rfid: inactive_rfid
        };
        let db = new mock_db.MockDB( members, {} );
        app = await server.createApp(this.connection, db );
    });

    it( 'Sets an RFID on a valid member', function (done) {
        let fetch_status = () => {
            request( app )
                .get( '/api/v1/rfid/' + good_rfid )
                .send()
                .expect( 200 )
                .end( function( err, res ) {
                    if( err ) done(err);
                    else done();
                });
        };

        process.env['TEST_RUN'] = "1";
        request( app )
            .put( '/api/v1/member/' + uuid1 + '/rfid' )
            .send({ rfid: good_rfid })
            .expect( 200 )
            .end( function( err, res ) {
                process.env['TEST_RUN'] = "0";
                if( err ) done(err);
                else fetch_status();
            });
    });

    it( 'Tries to fetch a member that doesn\'t exist', function (done) {
        request( app )
            .get( '/api/v1/rfid/' + invalid_rfid )
            .send()
            .expect( 404 )
            .end( function( err, res ) {
                if( err ) done(err);
                else done();
            });
    });

    it( 'Tries to fetch an inactive member', function (done) {
        request( app )
            .get( '/api/v1/rfid/' + inactive_rfid )
            .send()
            .expect( 403 )
            .end( function( err, res ) {
                if( err ) done(err);
                else done();
            });
    });
});
