/**
 * Used for validating parameters from the outside world.
 *
 * ```javascript
    import * as valid from "validation";


    try {
        valid.validate( args, [
            valid.isInteger( 'id' )
            ,valid.isWords( 'name' )
            ,valid.isName( 'firstName' )
            ,valid.isName( 'lastName' )
            ,valid.isUSAddress( 'address' )
            ,valid.isUrl( 'photo' )
            ,valid.isUSPhone( 'phone' )
        ]);
    }
    catch (err) {
        console.log( err.toString();
    }
 * ```
 */

/**
 * @param params  The parameters to validate
 * @param validation_list  An array of functions that will be used to validate the parameters. The functions in the list will take the parameters being matched. If a parameter fails to match, the function should throw an error.
 */
export let validate = function (params, validation_list) {
    let errors = [];

    validation_list.forEach( (callback) => {
        try {
            callback( params );
        }
        catch (err) {
            errors.push( err );
        }
    });

    if( errors.length > 0 ) {
        throw new Error( "Validation errors: "
            + errors.map(
                (err) => "<<" + err.toString() + ">>"
            ).join( " " )
        );
    }

    return true;
};


let matchSingleField = function (field, regex, typeName) {
    return (params) => {
        let value = params[field];

        if(! regex.exec( value )) {
            throw new Error( "Field '"
                + field
                + "' was supposed to be "
                + typeName
                + ", value is '"
                + value
                + "'"
            );
        }

        return true;
    };
};

export let isInteger =
    (field) => matchSingleField( field, /^-?[0-9]*$/, "integer" );
export let isName =
    (field) => matchSingleField( field, /^[A-Za-z]+$/, "name" );
export let isWords =
    (field) => matchSingleField( field, /^[A-Za-z0-9\s]*$/, "words" );
export let isUSPhone = 
    (field) => matchSingleField( field,
        // Why can't JavaScript support /x?
        /^(?:1[\s\-]*)?(?:[0-9]{3}[\s\-]*)?[0-9]{3}[\s\-]?[0-9]{4}$/,
        "phone" );

// From: https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
let urlRegex = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
export let isUrl =
    (field) => matchSingleField( field, urlRegex, "URL" );

export let isUSAddress = (field) => function (params) {
    let value = params[field];

    validate( value, [
        // TODO
        // This set of validations is all wrong. Address1 and 2 might have 
        // puncutation, zip needs a more formal validation, county and 
        // country potentially should verify from a list. State, too
        isWords( 'address1' )
        ,isWords( 'address2' )
        ,isWords( 'city' )
        ,isName( 'state' )
        ,isWords( 'zip' )
        ,isWords( 'county' )
        ,isWords( 'country' )
    ]);
};
