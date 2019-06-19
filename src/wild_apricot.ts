import * as request from "request";

const wa_domain = "api.wildapricot.org";
const wa_base_uri = "/v2";
const wa_oauth_uri = "https://oauth.wildapricot.org/auth/token";


export interface WAMember
{
    wild_apricot_id: number;
    first_name: string;
    last_name: string;
    is_active: boolean;
}

export interface WAMemberAnswers
{
    question: string;
    answer: string;
}

export interface WA
{
    fetch_pending_members(
        success_callback: (members: Array<WAMember>) => void
        ,error_callback: ( err: Error ) => void
    ): void;

    fetch_member_answers(
        member_id: string
        ,success_callback: (answers: Array<WAMemberAnswers> ) => void
        ,error_callback: ( err: Error ) => void
    ): void;

    set_member_active(
        member_id: string
        ,is_active: boolean
        ,success_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): void;
}


export class WildApricot
{
    private client_name: string;
    private client_secret: string;
    private account_id: string;
    private oauth_token: string;

    private contact_uri: string;
    private account_uri: string;


    constructor(
        client_name: string
        ,client_secret: string
        ,account_id: string
    )
    {
        this.client_name = client_name;
        this.client_secret = client_secret;
        this.account_id = account_id;

        this.contact_uri = "https://"
            + wa_domain
            + wa_base_uri
            + "/Accounts"
            + "/" + this.account_id
            + "/Contacts?$async=false";
        this.account_uri = "https://"
            + wa_domain
            + wa_base_uri
            + "/Accounts"
            + "/" + this.account_id
            + "/contacts";
    }


    public fetch_pending_members(
        success_callback: ( members: Array<WAMember> ) => void
        ,error_callback: ( err: Error ) => void
    ): void
    {
        // TODO if we get an auth failure, force refetch of oauth token 
        // and try again
        let fetch = (oauth_token: string) => {
            request.get( {
                url: this.contact_uri + "&$filter=Status eq PendingNew",
                headers: {
                    Accept: 'application/json'
                },
                auth: {
                    bearer: oauth_token
                }
            }, (error, response, body) => {
                if(! error && response.statusCode == 200 ) {
                    let parsed_users = JSON.parse( body );

                    let members = parsed_users.Contacts.map( (_) => {
                        return {
                            wild_apricot_id: _.Id
                            ,first_name: _.FirstName
                            ,last_name: _.LastName
                            ,is_active: _.MembershipEnabled
                        };
                    });
                    success_callback( members );
                }
                else {
                    let err = new Error( "Error fetching WA contact info: "
                        + error );
                    error_callback( err );
                }
            });
        };

        this.fetch_oauth_token(
            fetch
            ,error_callback
        );
    }

    public fetch_member_answers(
        member_id: string
        ,success_callback: (answers: Array<WAMemberAnswers> ) => void
        ,error_callback: ( err: Error ) => void
    ): void
    {
        // TODO if we get an auth failure, force refetch of oauth token 
        // and try again
        let fetch = (oauth_token: string) => {
            request.get( {
                url: this.account_uri + "/" + member_id,
                headers: {
                    Accept: 'application/json'
                },
                auth: {
                    bearer: oauth_token
                }
            }, (error, response, body) => {
                if(! error && response.statusCode == 200 ) {
                    let parsed_users = JSON.parse( body );

                    // TODO get questions out of this
                    let questions = parsed_users.FieldValues.map( (_) => {
                        return {
                            question: _.name
                            ,answer: _.value
                        };
                    });
                    success_callback( questions );
                }
                else {
                    let err = new Error( "Error fetching WA contact info: "
                        + error );
                    error_callback( err );
                }
            });
        };

        this.fetch_oauth_token(
            fetch
            ,error_callback
        );
    }

    public set_member_active(
        member_id: string
        ,is_active: boolean
        ,success_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): void
    {
        // TODO
        success_callback();
    }


    private fetch_oauth_token(
        success_callback: ( token: string ) => void
        ,error_callback: ( err: Error ) => void
    )
    {
        // TODO save oauth token in a general cache, such as memcached
        if( this.oauth_token ) {
            success_callback( this.oauth_token );
        }
        else {
            request.post({
                url: wa_oauth_uri,
                auth: {
                    user: this.client_name
                    ,pass: this.client_secret
                    ,sendImmediately: true
                },
                form: {
                    grant_type: 'client_credentials'
                    ,scope: 'auto'
                }
            }, (error, response, body) => {
                if( (! error) && (response.statusCode == 200) ) {
                    let parsed_response = JSON.parse( body );
                    this.oauth_token = parsed_response.access_token;
                    success_callback( this.oauth_token );
                }
                else {
                    error_callback( new Error( "Error fetching OAuth token"
                        + " from Wild Apricot: " + error ) );
                }
            });
        }
    }
}
