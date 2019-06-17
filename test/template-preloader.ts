import * as assert from "assert";
import * as Handlebars from "../src/handlebars-preloader";

describe( 'Load templates', () => {
    it( 'Loads a template', (done) => {
        let tmpl = new Handlebars.handlebars( './test_data/tmpl' );

        tmpl.load( () => {
            let text = tmpl.execute( 'foo', {
                foo: 1
            });
            assert( text.match( /got 1 for foo/ ), "Set value in template" );
            done();
        });
    });

    it( 'Loads a template, with partials', (done) => {
        let tmpl = new Handlebars.handlebars( './test_data/tmpl' );

        tmpl.load( () => {
            let text = tmpl.execute( 'bar', {
                foo: 1
                ,bar: 2
            });

            assert( text.match( /got 1 for foo/ ), "Set value in template" );
            assert( text.match( /got 2 for bar in partial/ ),
                "Set value in template in partial" );
            done();
        });
    });
});
