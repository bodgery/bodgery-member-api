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

let isInteger = function (field) {
    return (params) => {
        let value = params[field];
        let match = /^-?[0-9]*$/;

        if(! match.exec( value )) {
            throw new Error( "Field '"
                + field
                + "' was supposed to be an integer, value is '"
                + value
                + "'"
            );
        }

        return true;
    };
};


module.exports = {
    validate: validate
    ,isInteger: isInteger
};
