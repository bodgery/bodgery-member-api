import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";


describe( 'POST /v1/member/:member_id/send_signup_email', function () {
    let app;
    let test_email;
    beforeEach( async function() {
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
        app = await server.createApp(this.connection, db );
    });

    it( 'Sends the new member signup email', function (done) {
        if( test_email ) {
            request( app )
                .post( '/api/v1/member/01/send_signup_email' )
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
});
