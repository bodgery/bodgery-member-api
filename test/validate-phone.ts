var validation = require( '../src/validation.ts' );


describe( 'Validate US phone', function () {
    it( 'is US phone', function (done) {
        var errors = [];

        [
            "15555552222"
            ,"5552222"
            ,"5555552222"
            ,"1-555-555-2222"
            ,"555-2222"
            ,"555-555-2222"
            ,"1 555 555 2222"
            ,"555 2222"
            ,"555 555 2222"
        ].forEach( (val) => {
            try {
                validation.validate( { value: val }, [
                    validation.isUSPhone( 'value' ),
                ]);
            }
            catch(err) {
                errors.push( err.toString() );
            }
        });

        if( errors.length > 0 ) done( new Error(
            errors.map( (val) => "<<" + val + ">>" ).join( " " )
        ));
        else done();
    });

    it( 'is not US phone', function (done) {
        var errors = [];
        var fails = [
            "25552222"
            ,"foo bar"
            ,"155555522221"
        ];

        fails.forEach( (val) => {
            try {
                validation.validate( { value: val }, [
                    validation.isUSPhone( 'value' ),
                ]);
            }
            catch(err) {
                errors.push( err );
            }
        });

        if( errors.length == fails.length) done();
        else done( new Error( "Validation was supposed to fail for US phone" ));
    });
});
