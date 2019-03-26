let validate = function (params, validation_list) {
};

let isInteger = function (field) {
    return (params) => {
        let value = params[field];
        if(! value.match( /^-?[0-9]*$/ ) ) {
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
