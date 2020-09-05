import * as assert from "assert";
import * as request from "supertest";
import * as server from "../app";
import * as mock_db from "../src/db-mock";
import * as passwd from "../src/password";


describe( "User authorization with OAuth2", function () {
    let app;
    let db: mock_db.MockDB;
    let token = "foobarbaz";


    before( async () => {
        let tokens = {};
        tokens[token] = true;
        db = new mock_db.MockDB( {}, {}, null, tokens );

        app = await server.createApp(this.connection, db );
    });


    it( 'Sends an OAuth2 token to a secure page', (done) => {
        request( app )
            .get( '/members/pending' )
            .set( 'Authorization', 'Bearer ' + token )
            .expect( 200 )
            .end( (err, res) => {
                if(err) done(err);
                else done();
            });
    });
});
