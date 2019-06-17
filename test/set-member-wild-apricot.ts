import * as assert from "assert";
import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";


describe( 'PUT /v1/member/:member_id/wildapricot', function () {
    let members;
    before( () => {
        members = {
            "01": {
                full_data: {
                    wild_apricot_id: null
                }
            }
        };
        let db = new mock_db.MockDB( members, {} );
        server.start( db );
    });

    it( 'Sets a member wild apricot ID', function (done) {
        request( server.SERVER )
            .put( '/api/v1/member/01/wildapricot' )
            .send({
                wild_apricot_id: "567"
            })
            .expect( 204 )
            .end( function( err, res ) {
                if( err ) done(err);
                else {
                    assert.strictEqual(
                        members["01"]["full_data"]["wild_apricot_id"],
                        "567" );
                    done();
                }
            });
    });

    after( () => {
        server.stop();
    });
});
