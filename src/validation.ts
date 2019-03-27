let validate = function (params, validation_list) {
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

let isInteger =
    (field) => matchSingleField( field, /^-?[0-9]*$/, "integer" );
let isName =
    (field) => matchSingleField( field, /^[A-Za-z]+$/, "name" );
let isWords =
    (field) => matchSingleField( field, /^[A-Za-z0-9\s]+$/, "words" );
let isUSPhone = 
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
let isUrl =
    (field) => matchSingleField( field, urlRegex, "URL" );


module.exports = {
    validate: validate
    ,isInteger: isInteger
    ,isName: isName
    ,isWords: isWords
    ,isUSPhone: isUSPhone
    ,isUrl: isUrl
};
