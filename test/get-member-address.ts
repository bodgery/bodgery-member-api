import * as assert from "assert";
import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";

const uuid = "0662df8c-e43a-4e90-8b03-3849afbb533e";


describe( 'GET /v1/member/:member_id/address', function () {
    let app;

    before( async () => {
        process.env['TEST_RUN'] = "1";

        let members = {};
        members[uuid] =  {
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
        };
        let db = new mock_db.MockDB( members, {} );
        app = await server.createApp(this.connection, db );
    });

    it( 'Gets a member address', function (done) {
        request( app )
            .get( '/api/v1/member/' + uuid + '/address' )
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
        delete process.env['TEST_RUN'];
    });
});
