import * as assert from "assert";
import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";


describe( 'GET /v1/member/:member_id/address', function () {
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
                ,address: {
                    name: "Foo Bar"
                    ,address1: "123 Main St"
                    ,city: "Madison"
                    ,state: "WI"
                    ,zip: "53704"
                }
            }
        };
        let db = new mock_db.MockDB( members, {} );
        server.start( db );
    });

    it( 'Gets a member address', function (done) {
        request( server.SERVER )
            .get( '/api/v1/member/01/address' )
            .send()
            .expect( 200 )
            .expect( function(res) {
                var data = res.body;
                assert.strictEqual( data.name, "Foo Bar",
                    "Returned correct user" );
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
