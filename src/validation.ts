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


module.exports = {
    validate: validate
    ,isInteger: isInteger
    ,isName: isName
};
