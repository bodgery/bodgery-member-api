import * as db_impl from "../src/db";
import * as fs from "fs";
import * as funcs from "../src/request_funcs";
import * as pg from "../src/db-pg";
import * as request from "supertest";
import * as server from "../app";
import * as shortid from "shortid";
import * as yaml from "js-yaml";



describe( 'Create member in PostgreSQL', function () {
    let db: db_impl.DB;

    before( () => {
        var conf = yaml.safeLoad(
            fs.readFileSync( './config.yaml', 'utf8' ),
            {
                filename: "./config.yaml"
            }
        );
        db = new pg.PG(
            conf.db_host
            ,conf.db_port
            ,conf.db_name
            ,conf.db_user
            ,conf.db_password
        );

        server.start( db );
    });

    it( 'Adds a member to database', function (done) {
        let rfid = shortid.generate();
        // Name validation doesn't allow '_' or '-', but whitespace
        // is OK
        shortid.characters( "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ \t" );
        let name = shortid.generate();

        let test_fetch = () => {
            request( server.SERVER )
                .get( '/api/v1/members' )
                .send({ id: rfid })
                .expect( function (res) {
                    var data = res.body;
                    if( data[0].fullName != name ) {
                        throw new Error( "Name is wrong"
                            + "(expected '" + name + "', got: "
                            + data[0]['name'] + ")"
                        );
                    }
                    if( data[0].address.address1 != "123 Main St" ) {
                        throw new Error( "Address is wrong"
                            + "(expected '123 Main St', got: "
                            + data[0].address.address1 + ")"
                        );
                    }
                })
                .end( function( err, res ) {
                    if( err ) return done(err);
                    else done();
                });
        };

        request( server.SERVER )
            .post( '/api/v1/members' )
            .send({
                id: rfid
                ,name: name
                ,firstName: "Abe"
                ,lastName: "Foobar"
                ,address: {
                    address1: "123 Main St"
                    ,address2: null
                    ,city: "Madison"
                    ,state: "WI"
                    ,zip: "53714"
                    ,county: "Dane"
                    ,country: "United States of America"
                }
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
                else test_fetch();
            });
    });

    after( () => {
        server.stop();
        db.end();
    });
});
