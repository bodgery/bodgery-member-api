import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";


describe( 'PUT /v1/member/:member_id/address', function () {
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
        let db = new mock_db.MockDB( members );
        server.start( db );
    });

    it( 'Sets a member address', function (done) {
        request( server.SERVER )
            .put( '/api/v1/member/01/address' )
            .send({
                name: "Foo Bar"
                ,address1: "123 Main St"
                ,city: "Madison"
                ,state: "WI"
                ,zip: "53704"
            })
            .expect( 204 )
            .end( function( err, res ) {
                if( err ) done(err);
                else done();
            });
    });

    after( () => {
        server.stop();
    });
});