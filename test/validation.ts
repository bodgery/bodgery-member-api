var validation = require( '../src/validation.ts' );


describe( 'Validate numbers', function () {
    it( 'is made of digits', function (done) {
        var error;

        try {
            validation.validate( { value: 1234 }, [
                validation.isInteger( 'value' ),
            ]);
        }
        catch(err) {
            error = err;
        }


        if( error ) done( error );
        else done();
    });
});
