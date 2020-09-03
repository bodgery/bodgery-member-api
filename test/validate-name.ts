var validation = require('../src/validation.ts');

describe('Validate name', function () {
    it('is a name', function (done) {
        var error;

        try {
            validation.validate({value: 'foo1'}, [validation.isName('value')]);
        } catch (err) {
            error = err;
        }

        if (error) done(error);
        else done();
    });

    it('is not a name', function (done) {
        var error;

        try {
            validation.validate({value: '*&^&'}, [validation.isName('value')]);
        } catch (err) {
            error = err;
        }

        if (error) done();
        else done(new Error('Validation was supposed to fail for name'));
    });
});
