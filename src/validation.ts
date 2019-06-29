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


let matchSingleField = function (field, regex, typeName, allowNull = false) {
    return (params) => {
        let value = params[field];
        if( allowNull && value == null ) return true;

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
    (field, allowNull = false) => matchSingleField( field, /^-?[0-9]*$/, 
        "integer", allowNull );
export let isName =
    (field, allowNull = false) => matchSingleField( field, /^[A-Za-z0-9]+$/,
        "name", allowNull );
export let isWords =
    (field, allowNull = false ) => matchSingleField( field, /^[A-Za-z0-9\s]*$/, 
        "words", allowNull );
export let isUSPhone = 
    (field, allowNull = false) => matchSingleField( field,
        // Why can't JavaScript support /x?
        /^(?:1[\s\-]*)?(?:[0-9]{3}[\s\-]*)?[0-9]{3}[\s\-]?[0-9]{4}$/,
        "phone", allowNull );
export let isIdentifier = 
    (field, allowNull = false ) => matchSingleField( field, /^[A-Za-z0-9\-\_]*$/,
        "identifier", allowNull );

// From: https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
let urlRegex = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
export let isUrl =
    (field, allowNull = false) => matchSingleField( field, urlRegex, "URL",
        allowNull );

export let isUSAddress = () => function (params) {
    validate( params, [
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

export let isBoolean = (field) => function (params) {
    if(! ( 
        ("boolean" == typeof params[field])
        || ( params[field] === "true" )
        || ( params[field] === "false" )
    )) {
        throw new Error( "Field '"
            + field
            + "' was supposed to be a boolean"
            + ", value is '"
            + params[field]
            + "'" );
    }
};

export let byteLengthLimit = (limit) => function (param) {
    let buf = Buffer.from( param );
    let length = buf.toString( 'binary' ).length;

    if( length > limit ) {
        throw new Error( "Parameter is "
            + length 
            + " bytes, limit is "
            + limit
        );
    }
};


/*
 * OK, let's talk about email validation. There's a big, long, scary looking 
 * regex that supposedly validates email addresses. It actually still misses 
 * some of the insane things that are allowed inside email addresses (like 
 * deeply nested comments). It also can't tell you that an email address 
 * goes to an actual user on the other end. Only sending a validation message 
 * can do this ("click here to validate your account").
 *
 * Since this is for a public web site, we don't need to deal with internal 
 * email addresses that have no domain, or have a domain with no TLD suffix.
 * Therefore, we sanity check that there's at least an @-sign and a dot in 
 * the domain. There's also no sense letting whitespace through. Checking for 
 * almost anything else doesn't get us anywhere.
 */
 export let isPublicEmail = (field, allowNull = false) => matchSingleField(
     field, /^[^\s>]+@[^\s>]+\.[^\s>]+$/, "email", allowNull );

// Taken from:
// https://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
export let isUUID = (field, allowNull = false) => matchSingleField(
     field, /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/, "email", allowNull );
