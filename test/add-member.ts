import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";



describe( 'POST /v1/members', function () {
    before( () => {
        let db = new mock_db.MockDB([]);
        server.set_db( db );
    });

    it( 'Adds a member', function (done) {
        request( server.SERVER )
            .post( '/v1/members' )
            .send({
                id: "0123456789"
                ,name: "Abe Foobar"
                ,firstName: "Abe"
                ,lastName: "Foobar"
                ,address: "123 Main St"
                ,photo: "http://example.com/photo"
                ,phone: "15551234"
                ,profile: [
                    {
                        question: "Question 1"
                        ,answer: "Foo"
                    }
                    ,{
                        question: "Question 2"
                        ,answer: "Bar"
                    }
                ]
                ,approvedTools: [
                    { id: 1234 }
                    ,{ id: 5678 }
                ]
            })
            .expect( 204 )
            .end( function( err, res ) {
                if( err ) done(err);
                else done();
            });
    });

    after( () => {
        server.stop();
    });
});
