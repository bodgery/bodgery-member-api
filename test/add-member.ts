import * as assert from "assert";
import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";


describe( 'PUT /v1/member', function () {
    let app;

    before( async () => {
        process.env['TEST_RUN'] = "1";
        let db = new mock_db.MockDB([], {});
        app = await server.createApp(this.connection, db );
    });

    it( 'Adds a member', function (done) {
        request( app )
            .put( '/api/v1/member' )
            .send({
                rfid: "00000000"
                ,firstName: "Abe"
                ,lastName: "Foobar"
                ,phone: "15551234"
                ,email: "abe.foobar@example.com"
            })
            .expect( 201 )
            .expect( function(res) {
                var data = res.body;
                assert( data.id, "Returned a member ID" );
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
