import * as request from "supertest";
import * as server from "../app";


describe( 'Returns version list', function () {
    let app;

    before( async () => {
        process.env['TEST_RUN'] = "1";
        app = await server.createApp(this.connection, );
    });

    it( 'Gets versions', function (done) {
        request( app )
            .get( '/api/' )
            .expect( 200 )
            .expect( 'Content-Type', /json/ )
            .expect( function(res) {
                var data = res.body;
                if(! Array.isArray( data ) )
                    throw new Error( "Didn't return array" );
                if( "/v1" != data[0] ) throw new Error( "Doesn't list v1" );
            })
            .end( function( err, res ) {
                if( err ) return done(err);
                done();
            });
    });

    after( () => {
        delete process.env['TEST_RUN'];
    });
});
