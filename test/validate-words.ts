var validation = require('../src/validation.ts');

describe('Validate words', function () {
    it('is words', function (done) {
        var error;

        try {
            validation.validate({value: 'foo bar 123'}, [
                validation.isWords('value'),
            ]);
        } catch (err) {
            error = err;
        }

        if (error) done(error);
        else done();
    });

    it('is not words', function (done) {
        var error;

        try {
            validation.validate({value: "foo 'bar' baz"}, [
                validation.isWords('value'),
            ]);
        } catch (err) {
            error = err;
        }

        if (error) done();
        else done(new Error('Validation was supposed to fail for words'));
    });
});
