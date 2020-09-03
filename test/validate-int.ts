var validation = require('../src/validation.ts');

describe('Validate numbers', function () {
    it('is integer', function (done) {
        var error;

        try {
            validation.validate({value: 1234}, [validation.isInteger('value')]);
        } catch (err) {
            error = err;
        }

        if (error) done(error);
        else done();
    });

    it('is not integer', function (done) {
        var error;

        try {
            validation.validate({value: 'foobar'}, [
                validation.isInteger('value'),
            ]);
        } catch (err) {
            error = err;
        }

        if (error) done();
        else done(new Error('Validation was supposed to fail for integer'));
    });
});
