import * as assert from "assert";
import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";
import * as wa_api from "../src/wild_apricot_mock";


describe( 'GET /v1/members/pending', function() {
    let app;

    before( async () => {
        process.env['TEST_RUN'] = "1"
        let db = new mock_db.MockDB( null, null );
        app = await server.createApp(this.connection, db );
    });

    it( 'Gets all pending members on actual Wild Apricot', function(done) {
        request( app )
            .get( '/api/v1/members/pending' )
            .send()
            .expect( 200 )
            .expect( 'Content-Type', /json/ )
            .expect( function(res) {
                let data = res.body;
                if(! Array.isArray( data ) )
                    throw new Error( "Didn't return array" );
            })
            .end( function( err, res ) {
                if( err ) return done(err);
                done();
            })
    });

    after( () => {
        delete process.env['TEST_RUN'];
    });
});
