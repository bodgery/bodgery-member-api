var validation = require( '../src/validation.ts' );


describe( 'Validate booleans', function () {
    it( 'is booleans', function (done) {
        var error;

        try {
            validation.validate( { value: true }, [
                validation.isBoolean( 'value' ),
            ]);
        }
        catch(err) {
            error = err;
        }

        if( error ) done( error );
        else done();
    });

    it( 'is not booleans', function (done) {
        var error;

        try {
            validation.validate( { value: "foo 'bar' baz" }, [
                validation.isBoolean( 'value' ),
            ]);
        }
        catch(err) {
            error = err;
        }

        if( error ) done();
        else done( new Error( "Validation was supposed to fail for booleans" ) );
    });
});
