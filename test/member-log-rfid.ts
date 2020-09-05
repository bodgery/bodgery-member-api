import * as assert from "assert";
import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";


describe( 'Log RFID', function () {
    let app;
    let db;

    beforeEach( async function() {
        process.env['TEST_RUN'] = "1";

        db = new mock_db.MockDB( {}, {} );
        app = await server.createApp(this.connection, db );
    });

    it( 'Logs a successful RFID entry', function (done) {
        request( app )
            .post( '/api/v1/rfid/log_entry/000123/true' )
            .send()
            .expect( 200 )
            .end( function( err, res ) {
                if( err ) done(err);
                else {
                    assert.strictEqual( db.rfid_log[0][0], "000123",
                        "Logged RFID" );
                    assert.strictEqual( db.rfid_log[0][1], true,
                        "Was allowed in" );
                    done();
                }
            });
    });

    afterEach( async function() {
        delete process.env['TEST_RUN'];
    });
});
