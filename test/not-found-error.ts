import * as request from "supertest";
import * as server from "../app";


describe( "Not found error", function () {
    let app;

    before( async () => {
        process.env['TEST_RUN'] = "1";
        app = await server.createApp(this.connection, );
    });

    it( "Checks for not found error", function (done) {
        request( app )
            .get( '/not/found' )
            .expect( 404 )
            .expect( 'content-type', /html/ )
            .end( (err, res) => {
                if(err) throw err;
                done();
            });
    });

    after( () => {
        delete process.env['TEST_RUN'];
    });
});
