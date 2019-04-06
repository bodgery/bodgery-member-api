import * as request from "supertest";
import * as server from "../app";
import * as funcs from "../src/request_funcs";
import * as mock_db from "../src/db-mock";


describe( 'GET /v1/members', function () {
    before( () => {
        // Setup some static data for tests
        let members = [
            {
                id: "1234"
                ,name: "Foo Bar"
                ,firstName: "Foo"
                ,lastName: "Bar"
                ,address: {
                    address1: "123 Main St"
                    ,address2: ""
                    ,city: "Madison"
                    ,state: "WI"
                    ,zip: "53704"
                    ,county: "Dane"
                    ,country: "United States"
                }
                ,phone: "15555551234"
                ,photo: "file:///dev/null"
                ,profile: []
                ,approvedTools: []
            }
            ,{
                id: "1235"
                ,name: "Baz Qux"
                ,firstName: "Baz"
                ,lastName: "Qux"
                ,address: {
                    address1: "123 Main St"
                    ,address2: ""
                    ,city: "Madison"
                    ,state: "WI"
                    ,zip: "53704"
                    ,county: "Dane"
                    ,country: "United States"
                }
                ,phone: "15555551234"
                ,photo: "file:///dev/null"
                ,profile: []
                ,approvedTools: []
            }
            ,{
                id: "1236"
                ,name: "Quux Quuux"
                ,firstName: "Quux"
                ,lastName: "Quuux"
                ,address: {
                    address1: "123 Main St"
                    ,address2: ""
                    ,city: "Madison"
                    ,state: "WI"
                    ,zip: "53704"
                    ,county: "Dane"
                    ,country: "United States"
                }
                ,phone: "15555551234"
                ,photo: "file:///dev/null"
                ,profile: []
                ,approvedTools: []
            }
            ,{
                id: "1237"
                ,name: "Quuuux Quuuuux"
                ,firstName: "Quuuux"
                ,lastName: "Quuuuux"
                ,address: {
                    address1: "123 Main St"
                    ,address2: ""
                    ,city: "Madison"
                    ,state: "WI"
                    ,zip: "53704"
                    ,county: "Dane"
                    ,country: "United States"
                }
                ,phone: "15555551234"
                ,photo: "file:///dev/null"
                ,profile: []
                ,approvedTools: []
            }
        ];

        let db = new mock_db.MockDB( members );
        server.start( db );
    });

    it( 'Fetches all members', function (done) {
        request( server.SERVER )
            .get( '/v1/members' )
            .send()
            .expect( 200 )
            .expect( function(res) {
                var data = res.body;
                if(! Array.isArray( data ) )
                    throw new Error( "Didn't return array" );
                if( data.length < 4 )
                    throw new Error( "Did not return the expected length"
                        + " (got: " + Array.length + ", expected: >=4)" );
            })
            .end( function( err, res ) {
                if( err ) return done(err);
                done();
            });
    });

    it( 'Fetch a specific member by ID', function ( done ) {
        request( server.SERVER )
            .get( '/v1/members' )
            .send({ id: "1235" })
            .expect( 200 )
            .expect( function(res) {
                var data = res.body;
                if(! Array.isArray( data ) )
                    throw new Error( "Didn't return array" );
                if( data.length != 1 )
                    throw new Error( "Should only have returned one user" );
                if( data[0]['name'] != "Baz Qux" )
                    throw new Error( "Name is wrong (expected 'Baz Qux', got:"
                        + data[0]['name'] + ")");
            })
            .end( function( err, res ) {
                if( err ) return done(err);
                done();
            });
    });

    it( 'Fetch members with limit', function ( done ) {
        request( server.SERVER )
            .get( '/v1/members' )
            .send({ limit: 3 })
            .expect( 200 )
            .expect( function(res) {
                var data = res.body;
                if(! Array.isArray( data ) )
                    throw new Error( "Didn't return array" );
                if( data.length != 3 )
                    throw new Error( "Should have returned three users" );
            })
            .end( function( err, res ) {
                if( err ) return done(err);
                done();
            });
    });

    it( 'Fetch members with limit and skip', function ( done ) {
        request( server.SERVER )
            .get( '/v1/members' )
            .send({
                limit: 3
                ,skip: 3
            })
            .expect( 200 )
            .expect( function(res) {
                var data = res.body;
                if(! Array.isArray( data ) )
                    throw new Error( "Didn't return array" );
                if( data.length != 1 )
                    throw new Error( "Should have returned one user" );
            })
            .end( function( err, res ) {
                if( err ) return done(err);
                done();
            });
    });

    it( 'Fetch members with sorting', function ( done ) {
        request( server.SERVER )
            .get( '/v1/members' )
            .send({
                sort: "name"
            })
            .expect( 200 )
            .expect( function(res) {
                var data = res.body;
                if(! Array.isArray( data ) )
                    throw new Error( "Didn't return array" );
                if( data[0]['name'] != "Baz Qux" ) 
                    throw new Error( "Did not sort" );
            })
            .end( function( err, res ) {
                if( err ) return done(err);
                done();
            });
    });

    after( () => {
        server.stop();
    });
});
