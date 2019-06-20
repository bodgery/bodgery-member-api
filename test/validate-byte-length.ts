import * as assert from "assert";
import * as validation from "../src/validation";


describe( 'Validate byte length', () => {

    it( 'allows limited byte lengths', () => {
        validation.validate( "1234", [
            validation.byteLengthLimit( 8 )
        ]);
    });

    it( 'disallows oversized byte length', () => {
        let error = false;

        try {
            validation.validate( "123456789", [
                validation.byteLengthLimit( 8 )
            ]);
        }
        catch(err) {
            error = true;
        }

        assert( error, "Threw error when size was too big" );
    });
});
