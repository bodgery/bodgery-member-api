var validation = require('../src/validation.ts');

describe('Validate US address', function () {
    it('is US address', function (done) {
        var error;
        let address = {
            address1: '4444 Robertson Rd',
            address2: '',
            city: 'Madison',
            state: 'WI',
            zip: '53714',
            county: 'Dane',
            country: 'United States',
        };

        try {
            validation.validate(address, [validation.isUSAddress()]);
        } catch (err) {
            error = err;
        }

        if (error) done(error);
        else done();
    });

    it('is not US address', function (done) {
        var error;
        let address = {
            address1: '...',
            address2: '',
            city: 'Madison',
            state: 'WI',
            zip: '53714',
            county: 'Dane',
            country: 'United States',
        };

        try {
            validation.validate(address, [validation.isUSAddress()]);
        } catch (err) {
            error = err;
        }

        if (error) done();
        else
            done(
                new Error('Validation was supposed to fail for non-US address'),
            );
    });
});
