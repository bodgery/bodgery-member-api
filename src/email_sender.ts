import * as google from 'googleapis';
import * as oauth from 'google-auth-library';
import * as Handlebars from "./handlebars-preloader";
import * as wa_api from './wild_apricot';

const EMAIL_TMPL_PATH = './emails';

let email_tmpls;


export class Email
{
    private auth: oauth.OAuth2Client;

    constructor( args: {
        auth: oauth.OAuth2Client
    })
    {
        this.auth = args.auth;
    }

    public init(
        callback: () => void
    ): void
    {
        if(! email_tmpls) {
            email_tmpls = new Handlebars.handlebars( EMAIL_TMPL_PATH );
            email_tmpls.load( callback );
        }
        else {
            callback();
        }
    }


    public send_new_member_signup( args: {
        to_name: string
        ,to_email: string
        ,from_name: string
        ,from_email: string
        ,success_callback: () => void
        ,error_callback: ( err: Error ) => void
    }): void
    {
        if(! email_tmpls ) {
            let err = new Error( "Need to call init() before sending email" );
            args.error_callback( err );
            return;
        }

        const gmail = new google.gmail_v1.Gmail({
            auth: this.auth
        });

        const message = email_tmpls.execute( 'member_signup', {
            from_name: args.from_name
            ,from_email: args.from_email
            ,to_name: args.to_name
            ,to_email: args.to_email
            ,subject: "Welcome to the Bodgery"
        });
        // TODO below should be wrapped into send() private method
        const encoded_message = Buffer.from( message )
            .toString( 'base64' )
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        gmail.users.messages.send(
            {
                userId: 'me'
                ,requestBody: {
                    raw: encoded_message
                }
            }
            ,(err) => {
                if( err ) {
                    args.error_callback( err );
                }
                else {
                    args.success_callback();
                }
            }
        );
    }

    public send_new_group_member_signup( args: {
        to_name: string
        ,to_email: string
        ,from_name: string
        ,from_email: string
        ,member_first_name: string
        ,answers: Array<wa_api.WAMemberAnswers>
        ,success_callback: () => void
        ,error_callback: ( err: Error ) => void
    }): void
    {
        if(! email_tmpls ) {
            let err = new Error( "Need to call init() before sending email" );
            args.error_callback( err );
            return;
        }

        const gmail = new google.gmail_v1.Gmail({
            auth: this.auth
        });

        const message = email_tmpls.execute( 'group_new_member', {
            from_name: args.from_name
            ,from_email: args.from_email
            ,to_name: args.to_name
            ,to_email: args.to_email
            ,first_name: args.member_first_name
            ,answer1: args.answers[0].answer
            ,answer2: args.answers[1].answer
            ,answer3: args.answers[2].answer
            ,answer4: args.answers[3].answer
            ,answer5: args.answers[4].answer
            ,subject: "Welcome to our new member, " + args.member_first_name
        });
        // TODO below should be wrapped into send() private method
        const encoded_message = Buffer.from( message )
            .toString( 'base64' )
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        gmail.users.messages.send(
            {
                userId: 'me'
                ,requestBody: {
                    raw: encoded_message
                }
            }
            ,(err) => {
                if( err ) {
                    args.error_callback( err );
                }
                else {
                    args.success_callback();
                }
            }
        );
    }
}
