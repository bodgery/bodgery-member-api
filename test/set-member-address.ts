import * as request from 'supertest';
import * as server from '../app';
import * as funcs from '../src/request_funcs';
import * as mock_db from '../src/db-mock';

const uuid = '0662df8c-e43a-4e90-8b03-3849afbb533e';

describe('PUT /v1/member/:member_id/address', function () {
    before(() => {
        process.env['TEST_RUN'] = '1';
        let members = {};
        members[uuid] = {
            simple_data: {
                rfid: '01',
                firstName: 'Foo',
                lastName: 'Bar',
                phone: '15555551234',
                email: 'foo.bar@example.com',
                photo: 'https://example.com/',
            },
        };
        let db = new mock_db.MockDB(members, {});
        return server.start(db);
    });

    it('Sets a member address', function (done) {
        request(server.SERVER)
            .put('/api/v1/member/' + uuid + '/address')
            .send({
                name: 'Foo Bar',
                address1: '123 Main St',
                city: 'Madison',
                state: 'WI',
                zip: '53704',
            })
            .expect(204)
            .end(function (err, res) {
                if (err) done(err);
                else done();
            });
    });

    after(() => {
        delete process.env['TEST_RUN'];
        return server.stop();
    });
});
