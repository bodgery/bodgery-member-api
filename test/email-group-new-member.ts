import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";


describe( 'POST /v1/member/:member_id/send_group_signup_email', function () {
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
                },
                member_questions: {
                    answer1: "foo"
                    ,answer2: "bar"
                    ,answer3: "baz"
                    ,answer4: "qux"
                    ,answer5: "quux"
                }
            }
        };
        let db = new mock_db.MockDB( members, {} );
        server.start( db );
    });

    it( 'Sends the new member signup email for the group', function (done) {
        if( test_email ) {
            request( server.SERVER )
                .post( '/api/v1/member/01/send_group_signup_email' )
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
        server.stop();
    });
});
