import * as google from 'googleapis';
import * as oauth from 'google-auth-library';


export class Email
{
    private auth: oauth.OAuth2Client;

    constructor( args: {
        auth: oauth.OAuth2Client
    })
    {
        this.auth = args.auth;
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
        const gmail = new google.gmail_v1.Gmail({
            auth: this.auth
        });

		const messageParts = [
			'From: ' + args.from_name + " <" + args.from_email + ">"
			,'To: ' + args.to_name + " <" + args.to_email + ">"
			,'Subject: Test Send Email'
			,''
			,'Test message'
		];
		const message = messageParts.join('\n');
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
console.log( "Error: %o", err );
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
