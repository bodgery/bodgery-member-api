import * as assert from "assert";
import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";


describe( '/v1/member/:member_id/is_active', function () {
    before( () => {
        let members = {
            "01": {
                is_active: true
            }
        };
        let db = new mock_db.MockDB( members );
        server.start( db );
    });

    it( 'Sets member status', function (done) {
        let fetch_status = () => {
            request( server.SERVER )
                .get( '/api/v1/member/01/is_active' )
                .send()
                .expect( 200 )
                .end( function( err, res ) {
                    if( err ) done(err);
                    else {
                        assert( ! res.body, "Returned false" );
                        done();
                    }
                });
        };

        request( server.SERVER )
            .put( '/api/v1/member/01/is_active' )
            .send({ is_active: false })
            .expect( 200 )
            .end( function( err, res ) {
                if( err ) done(err);
                else fetch_status();
            });
    });

    after( () => {
        server.stop();
    });
});
