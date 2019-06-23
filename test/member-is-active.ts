import * as assert from "assert";
import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";
import * as wa_api from "../src/wild_apricot_mock";


describe( '/v1/member/:member_id/is_active', function () {
    let wa_mock: wa_api.MockWA;

    before( () => {
        process.env['TEST_RUN'] = "1";
        let members = {
            "01": {
                is_active: false
            }
        };
        let db = new mock_db.MockDB( members, {} );

        wa_mock = new wa_api.MockWA({
            members: {
                "01": {
                    is_active: false
                }
            }
        });

        server.start( db, null, wa_mock );
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
                        assert( res.body, "Returned true" );
                        assert( wa_mock.members["01"].is_active,
                            "Set is_active on WA" );
                        done();
                    }
                });
        };

        request( server.SERVER )
            .put( '/api/v1/member/01/is_active' )
            .send({ is_active: true })
            .expect( 200 )
            .end( function( err, res ) {
                if( err ) done(err);
                else fetch_status();
            });
    });

    after( () => {
        server.stop();
        delete process.env['TEST_RUN'];
    });
});
