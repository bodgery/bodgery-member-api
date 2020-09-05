import * as assert from "assert";
import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";

const uuid = "0662df8c-e43a-4e90-8b03-3849afbb533e";


describe( 'PUT /v1/member/:member_id/wildapricot', function () {
    let app;
    let members;

    before( async () => {
        process.env['TEST_RUN'] = "1";
        members = {};
        members[uuid] = {
            full_data: {
                wild_apricot_id: null
            }
        };
        let db = new mock_db.MockDB( members, {} );
        app = await server.createApp(this.connection, db );
    });

    it( 'Sets a member wild apricot ID', function (done) {
        request( app )
            .put( '/api/v1/member/' + uuid + '/wildapricot' )
            .send({
                wild_apricot_id: "567"
            })
            .expect( 204 )
            .end( function( err, res ) {
                if( err ) done(err);
                else {
                    assert.strictEqual(
                        members[uuid]["full_data"]["wild_apricot_id"],
                        "567" );
                    done();
                }
            });
    });

    after( () => {
        delete process.env['TEST_RUN'];
    });
});
