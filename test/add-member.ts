var request = require( 'supertest' );
var server = require( '../app.ts' );

const app = server.app;


describe( 'POST /v1/members', function () {
    before( () => {
        let db = {
            add_member: ( member_data ) => {
                // Ignore
            }
        };

        server.set_db( db );
    });

    it( 'Adds a member', function (done) {
        request( app )
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
                if( err ) return done(err);
                done();
                process.exit();
            });
    });
});
