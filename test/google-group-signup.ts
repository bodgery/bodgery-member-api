import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";


describe( 'PUT /v1/member/:member_id/google_group_signup', function () {
    let test_email;
    before( () => {
        test_email = process.env['TEST_EMAIL'];
        let members = {
            "01": {
                simple_data: {
                    rfid: "01"
                    ,firstName: "Foo"
                    ,lastName: "Bar"
                    ,phone: "15555551234"
                    ,email: test_email
                    ,photo: "https://example.com/"
                }
            }
        };
        let db = new mock_db.MockDB( members, {} );
        return server.start( db );
    });

    it( 'Adds member to the Google Group list', function (done) {
        if( test_email ) {
            request( server.SERVER )
                .put( '/api/v1/member/01/google_group_signup' )
                .expect( 200 )
                .end( function( err, res ) {
                    if( err ) done(err);
                    else done();
                });
        }
        else {
            console.log( "Set TEST_EMAIL env var with an email address"
                + " to run this test" );
            done();
        }
    });

    after( () => {
        return server.stop();
    });
});
