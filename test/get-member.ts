import * as assert from "assert";
import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";


describe( 'GET /v1/member', function () {
    before( () => {
        let members = {
            "01": {
                simple_data: {
                    rfid: "01"
                    ,firstName: "Foo"
                    ,lastName: "Bar"
                    ,phone: "15555551234"
                    ,email: "foo.bar@example.com"
                    ,photo: "https://example.com/"
                }
            }
        };
        let db = new mock_db.MockDB( members, {} );
        server.start( db );
    });

    it( 'Fetches a member', function (done) {
        request( server.SERVER )
            .get( '/api/v1/member/01' )
            .send()
            .expect( 200 )
            .expect( function(res) {
                var data = res.body;
                assert.strictEqual( data.firstName, "Foo",
                    "Returned correct user" );
                assert.strictEqual( data.photo, "https://example.com/",
                    "Returned correct photo URL" );
            })
            .end( function( err, res ) {
                if( err ) done(err);
                else done();
            });
    });

    after( () => {
        server.stop();
    });
});
