import * as request from "supertest";
import * as server from "../app";


describe( "Not found error", function () {
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
});
