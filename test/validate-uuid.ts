var validation = require('../src/validation.ts');

describe('Validate UUID', function () {
    it('is a uuid', function (done) {
        var error;

        try {
            validation.validate(
                {value: 'c56a4180-65aa-42ec-a945-5fd21dec0538'},
                [validation.isUUID('value')],
            );
        } catch (err) {
            error = err;
        }

        if (error) done(error);
        else done();
    });

    it('is not a uuid', function (done) {
        var error;

        try {
            validation.validate({value: '*&^&'}, [validation.isUUID('value')]);
        } catch (err) {
            error = err;
        }

        if (error) done();
        else done(new Error('Validation was supposed to fail for uuid'));
    });
});
