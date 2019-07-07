import * as assert from "assert";
import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";
import * as wa_api from "../src/wild_apricot_mock";

const uuid = "0662df8c-e43a-4e90-8b03-3849afbb533e";


describe( '/v1/member/:member_id/is_active', function () {
    let wa_mock: wa_api.MockWA;

    before( () => {
        process.env['TEST_RUN'] = "1";
        let members = {};
        members[uuid] =  {
            wild_apricot_id: uuid
            ,is_active: false
        };
        let db = new mock_db.MockDB( members, {} );

        let wa_members = {};
        wa_members[uuid] = {
            is_active: false
        };
        wa_mock = new wa_api.MockWA({
            members: wa_members
        });

        server.start( db, null, wa_mock );
    });

    it( 'Sets member status', function (done) {
        let fetch_status = () => {
            request( server.SERVER )
                .get( '/api/v1/member/' + uuid + '/is_active' )
                .send()
                .expect( 200 )
                .end( function( err, res ) {
                    if( err ) done(err);
                    else {
                        assert( res.body, "Returned true" );
                        assert( wa_mock.members[uuid].is_active,
                            "Set is_active on WA" );
                        done();
                    }
                });
        };

        request( server.SERVER )
            .put( '/api/v1/member/' + uuid + '/is_active' )
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
