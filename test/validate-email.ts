var validation = require('../src/validation.ts');

describe('Validate Email', function () {
    it('is email', function (done) {
        var errors = [];

        [
            'foobar@example.com',
            'foo.bar@example.com',
            'foo+bar@example.com',
        ].forEach(val => {
            try {
                validation.validate({value: val}, [
                    validation.isPublicEmail('value'),
                ]);
            } catch (err) {
                errors.push(err.toString());
            }
        });

        if (errors.length > 0)
            done(new Error(errors.map(val => '<<' + val + '>>').join(' ')));
        else done();
    });

    it('is not email', function (done) {
        let errors = [];

        let fails = [
            'foobar',
            'foobar@example',
            'example.com',
            'foobar @exaple.com',
        ];
        fails.forEach(val => {
            try {
                validation.validate({value: val}, [
                    validation.isPublicEmail('value'),
                ]);
            } catch (err) {
                errors.push(err);
            }
        });

        if (errors.length == fails.length) done();
        else done(new Error('Validation was supposed to fail for email'));
    });
});
