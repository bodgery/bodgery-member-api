import * as Email from '../src/email_sender';
import * as PG from '../src/db-pg';
import * as WA from '../src/wild_apricot';
import * as Yaml from 'js-yaml';

const TO_EMAIL = 'board@thebodgery.org';


const conf = Yaml.safeLoad(
    fs.readFileSync( 'config.yaml', 'utf8' ),
    {
        filename: "config.yaml"
    }
);
const db = new PG.PG(
    conf.db_host
    ,conf.db_port
    ,conf.db_name
    ,conf.db_user
    ,conf.db_password
);
const wa = new wa_api.WildApricot(
    conf.wa_api_client
    ,conf.wa_api_secret
    ,conf.wa_account_id
);


function get_members_db( db ): Promise<any>
{
    const promise = new Promise( (resolve, reject) => {
        db.get_members({
            offset: 0
            ,per_page: null
            ,(members) => {
                const formatted_members = {};

                members.forEach( (_) => {
                    const member = {
                        wa_id: _.wildapricot_id
                        ,status: _.status
                        ,first_name: _.first_name
                        ,last_name: _.last_name
                        ,email: _.email
                    };
                    formatted_members[ member.wa_id ] = member;
                });

                resolve( formatted_members );
            }
            ,(err) => {
                reject( err );
            }
        });
    });

    return promise;
}

function get_members_wa( wa ): Promise<any>
{
    const promise = new Promise( (resolve, reject) => {
        wa.fetch_all_members(
            (wa_members) => {
                const formatted_members = {};

                members.forEach( (_) => {
                    const member = {
                        wa_id: _.wild_apricot_id
                        ,status: _.is_active
                        ,first_name: _.first_name
                        ,last_name: _.last_name
                        ,email: _.email
                    };
                    formatted_members[member.wa_id] = member;
                });

                resolve( formatted_members );
            }
            ,(err) => {
                reject( err );
            }
        );
    });

    return promise;
}

function compare( members1, members2 )
{
    let mismatch_results = {};
    members1.forEach( (_) => {
        let wa_id = _.wa_id;
        if( _.status && ! members2[wa_id].status ) {
            mismatch_results[wa_id] = _;
        }
    });

    return mismatch_results;
}

function total_active_members( members ): number
{
    let active_members = members.filter( (_) => {
        return _.status;
    });
    return active_members.length;
}

function send_email( args: {
    active_in_local_not_wa: Array
    ,active_in_wa_not_local: Array
    ,total_active_members: number
}): Promise<any>
{
    const promise = new Promise( (resolve, reject) => {
        // TODO fetch_google_auth() and fetch_google_email_scopes()
        // are private to src/request_funcs. Make them more generally 
        // accessible.
        // TODO create sender.send_reconciliation()
        fetch_google_auth(
            conf
            ,fetch_google_email_scopes()
            ,( client ) => {
                const sender = new Email.Email({
                    auth: client
                });
                sender.init( () => {
                    sender.send_reconciliation({
                        to_email: TO_EMAIL
                        ,from_name: conf['email_new_member_signup_from_name']
                        ,from_email: conf['email_new_member_signup_from_email']
                        ,success_callback: () => {
                            console.log( "Email sent" );
                            resolve();
                        }
                        ,error_callback: ( err: Error ) => {
                            console.log( "Error sending email: "
                                + err.toString() );
                            reject( err );
                        }
                    });
                });
            }
        )
    });

    return promise;
}


Promise.all([
    get_members_db( db )
    ,get_members_wa( wa )
]).then( (values) => {
    const db_members = values[0];
    const wa_members = values[1];

    const active_in_local_not_wa = compare( db_members, wa_members );
    const active_in_wa_not_local = compare( wa_members, db_members );
    const total_active_members = total_active_members( wa_members );

    const email_promise = send_email({
        active_in_local_not_wa: active_in_local_not_wa
        ,active_in_wa_not_local: active_in_wa_not_local
        ,total_active_members: total_active_mmebers
    });
    return email_promise;
}).then( () => {
    return;
});
