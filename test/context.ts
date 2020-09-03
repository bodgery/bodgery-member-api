import * as assert from 'assert';
import * as c from '../src/context';
import * as shortid from 'shortid';

describe('Init context', function () {
    it('Creates a new context', function (done) {
        let did_log: boolean = false;
        let logger = {
            fatal: (...args) => {
                did_log = true;
            },
            error: (...args) => {},
            warn: (...args) => {},
            info: (...args) => {},
            debug: (...args) => {},
        };

        let conf = {};
        let request_id = shortid.generate();
        let ctx = new c.Context(conf, logger, null, null);

        ctx.logger.fatal('Log error');
        assert(did_log, 'Log happened');

        done();
    });
});
