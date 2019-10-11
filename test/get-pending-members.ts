import * as assert from "assert";
import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";
import * as wa_api from "../src/wild_apricot_mock";


describe( 'GET /v1/members/pending', function() {
    before( () => {
        process.env['TEST_RUN'] = "1";
        let wa_mock = new wa_api.MockWA({
            // TODO fill in pending and existing members
            pending: [
                {
                    wild_apricot_id: 1
                    ,first_name: "One"
                    ,last_name: "Number"
                    ,phone: "555 555 1234"
                    ,email: "one@example.com"
                    ,is_active: false
                }
                ,{
                    wild_apricot_id: 2
                    ,first_name: "Two"
                    ,last_name: "Number"
                    ,phone: "555 555 1234"
                    ,email: "one@example.com"
                    ,is_active: false
                }
                ,{
                    wild_apricot_id: 3
                    ,first_name: "Three"
                    ,last_name: "Number"
                    ,phone: "555 555 1234"
                    ,email: "one@example.com"
                    ,is_active: false
                }
            ]
            ,active: [
                {
                    wild_apricot_id: 4
                    ,first_name: "Four"
                    ,last_name: "Number"
                    ,phone: "555 555 1234"
                    ,email: "one@example.com"
                    ,is_active: true
                }
                ,{
                    wild_apricot_id: 5
                    ,first_name: "Five"
                    ,last_name: "Number"
                    ,phone: "555 555 1234"
                    ,email: "one@example.com"
                    ,is_active: true
                }
            ]
        });
        let db = new mock_db.MockDB( null, null );
        return server.start( db, null, wa_mock );
    });

    it( 'Gets all pending members', function(done) {
        request( server.SERVER )
            .get( '/api/v1/members/pending' )
            .send()
            .expect( 200 )
            .expect( 'Content-Type', /json/ )
            .expect( function(res) {
                let data = res.body;
                if(! Array.isArray( data ) )
                    throw new Error( "Didn't return array" );
                assert.strictEqual( data.length, 3 );

                assert.strictEqual( data[0].wild_apricot_id, 1 );
                assert.strictEqual( data[0].is_active, false );
            })
            .end( function( err, res ) {
                if( err ) return done(err);
                done();
            })
    });

    after( () => {
        delete process.env['TEST_RUN'];
        return server.stop();
    });
});
