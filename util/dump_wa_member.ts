import * as fs from 'fs';
import config from '../src/config';
import * as WA from '../src/wild_apricot';
import * as yaml from 'js-yaml';

const WA_ID = process.argv[2];
if (!WA_ID) {
    throw new Error('Need to pass Wild Apricot member ID to lookup');
}

let conf = config();

let wa = new WA.WildApricot(
    conf['wa_api_client'],
    conf['wa_api_secret'],
    conf['wa_account_id'],
);
wa.fetch_member_data(
    parseInt(WA_ID),
    member_data => {
        console.log(JSON.stringify(member_data, null, 2));
    },
    err => {
        throw err;
    },
);
