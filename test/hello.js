var request = require( 'supertest' );
var server = require( '../app.js' );

const app = server.app;


describe( 'Hello', function () {
    it( 'Basic request', function (done) {
        request( app )
            .get( '/' )
            .expect( 200, done );
        process.exit();
    });
});
