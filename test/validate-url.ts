var validation = require( '../src/validation.ts' );


describe( 'Validate URL', function () {
    it( 'is URL', function (done) {
        var error;

        try {
            validation.validate( { value: "http://example.com" }, [
                validation.isUrl( 'value' ),
            ]);
        }
        catch(err) {
            error = err;
        }

        if( error ) done( error );
        else done();
    });

    it( 'is not URL', function (done) {
        var error;

        try {
            validation.validate( { value: "foo 'bar' baz" }, [
                validation.isUrl( 'value' ),
            ]);
        }
        catch(err) {
            error = err;
        }

        if( error ) done();
        else done( new Error( "Validation was supposed to fail for url" ) );
    });
});
