import * as request from "supertest";
import * as server from "../app";


describe( "Not found error", function () {
    before( () => {
        process.env['TEST_RUN'] = "1";
    });

    it( "Checks for not found error", function (done) {
        request( server.SERVER )
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
