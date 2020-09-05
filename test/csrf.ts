import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";


describe(
    'Checks that CSRF tokens are required on methods that change state',
    function () {
    let app;

    beforeEach( async function() {
        let db = new mock_db.MockDB([], {});
        app = await server.createApp(this.connection, db );
    });

/*
    it( 'Adds a member', function (done) {
        request( app )
            .put( '/api/v1/member' )
            .send({
                rfid: "00000000"
                ,firstName: "Abe"
                ,lastName: "Foobar"
                ,phone: "15551234"
                ,email: "abe.foobar@example.com"
                ,photo: "https://example.com/"
            })
            .expect( 204 )
            .end( function( err, res ) {
                if( err ) done(err);
                else done();
            });
    });
 */
});
