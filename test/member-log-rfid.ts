import * as assert from "assert";
import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";


describe( 'Log RFID', function () {
    let db;

    before( () => {
        process.env['TEST_RUN'] = "1";

        db = new mock_db.MockDB( {}, {} );
        return server.start( db );
    });

    it( 'Logs a successful RFID entry', function (done) {
        request( server.SERVER )
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

    after( () => {
        delete process.env['TEST_RUN'];
        return server.stop();
    });
});
