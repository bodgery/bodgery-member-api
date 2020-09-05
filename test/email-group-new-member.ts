import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";
import * as wa_api from "../src/wild_apricot_mock";

const PHOTO_DIR = "test_data/photos/";
const TEST_PHOTO = "test_data/bodgery_logo.jpg";


describe( 'POST /v1/member/:member_id/send_group_signup_email', function () {
    let app;
    let test_email;
    before( async () => {
        test_email = process.env['TEST_EMAIL'];
        let members = {
            "01": {
                simple_data: {
                    rfid: "01"
                    ,firstName: "Foo"
                    ,lastName: "Bar"
                    ,phone: "15555551234"
                    ,email: test_email
                }
                ,photo: TEST_PHOTO
            }
        };
        let db = new mock_db.MockDB( members, {} );

        let conf = server.default_conf();
        conf['photo_dir'] = PHOTO_DIR;

        let wa_mock = new wa_api.MockWA({
            member_answers: {
                "01": [
                    {
                        question: "foo"
                        ,answer: "1"
                    }
                    ,{
                        question: "foo"
                        ,answer: "2"
                    }
                    ,{
                        question: "foo"
                        ,answer: "3"
                    }
                    ,{
                        question: "foo"
                        ,answer: "4"
                    }
                    ,{
                        question: "foo"
                        ,answer: "5"
                    }
                ]
            }
        });

        app = await server.createApp(this.connection, db, conf, wa_mock );
    });

    it( 'Sends the new member signup email for the group', function (done) {
        if( test_email ) {
            request( app )
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
});
