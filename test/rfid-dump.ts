import * as assert from "assert";
import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";

const uuid = "0662df8c-e43a-4e90-8b03-3849afbb533e";


describe( 'GET /v1/rfids', function () {
    let app;

    beforeEach( async function() {
        process.env['TEST_RUN'] = "1";

        let members = {}
        members["01"] = {
            simple_data: {
                rfid: "rfid01"
                ,firstName: "Foo"
                ,lastName: "Bar"
                ,phone: "15555551234"
                ,email: "foo.bar@example.com"
                ,photo: "https://example.com/"
            }
        };
        members["02"] = {
            simple_data: {
                rfid: "rfid02"
                ,firstName: "Foo"
                ,lastName: "Bar"
                ,phone: "15555551234"
                ,email: "foo.bar@example.com"
                ,photo: "https://example.com/"
            }
        };

        let db = new mock_db.MockDB( members, {} );
        app = await server.createApp(this.connection, db );
    });

    it( 'Fetches the RFID dump', function (done) {
        request( app )
            .get( '/api/v1/rfids' )
            .send()
            .expect( 200 )
            .expect( function(res) {
                var data = res.body;
                assert( data["rfid01"], "First user is there" );
                assert( data["rfid02"], "Second user is there" );
            })
            .end( function( err, res ) {
                if( err ) done(err);
                else done();
            });
    });

    afterEach( async function() {
        delete process.env['TEST_RUN'];
    });
});
