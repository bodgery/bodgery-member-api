import * as googleAuth from 'google-auth-library';
import { Credentials } from 'google-auth-library/build/src/auth/credentials';

// TODO 
// * Get credentials from file in config.yaml -> google_credentials_file
// * Generate auth URL
// * Wait for user to come back with code
// * Take code and get the access token
// * Dump credentials data to file
//     * Have main app read from the seprate file, rather than config.yaml
//     * Have main app update access, refresh, and expiration configs 
//       automatically
const scopes: Array<string> = [
    'https://www.googleapis.com/auth/admin.directory.group.member'
    ,'https://www.googleapis.com/auth/admin.directory.group'
    ,'https://mail.google.com/'
    ,'https://www.googleapis.com/auth/gmail.modify'
    ,'https://www.googleapis.com/auth/gmail.compose'
    ,'https://www.googleapis.com/auth/gmail.send'
];


/**
 * Step 0: Create OAuth2 credentials at the Google Console (make sure to download JSON, not only just get key and secret)
 */

export const credentials = {
    "web":{"client_id":"1062829500837-hqnjs9c7hpt45e5ufamvgstgvn2g714c.apps.googleusercontent.com","project_id":"directory-test-214521","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://www.googleapis.com/oauth2/v3/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"B1AmB8v81RzeyXRoDEaoBAyT","redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}
};

/**
 * Step 1: Authorize in the browser
 */

export function getAuthorizeUrl(callback: (err: any, url: string) => any): void {
	const oauth2Client = new googleAuth.OAuth2Client(credentials.web.client_id, credentials.web.client_secret, credentials.web.redirect_uris[0]);

	const authUrl = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: scopes
	});

	callback(null, authUrl);
}


/**
 * Step 2: Get auth token
 */

/**
 * Paste in your one-time use authorization code here
 */
const code: string = "4/aQGawa43E5PQ6HgTVNb0AMXt_IKqSPTokUqxV06huOX1KcdslbrDT3s";

export function getAccessToken(callback: (err: any, token?: Credentials | null) => any): void {
	const oauth2Client = new googleAuth.OAuth2Client(credentials.web.client_id, credentials.web.client_secret, credentials.web.redirect_uris[0]);

	oauth2Client.getToken(code, (err, token) => {
		if(err) return console.log(err);

		callback(null, token);
	});
}

getAccessToken((err, token) => {
	if(err) return console.log(err);
	console.log("Auth token is: ", token);
});

/*
getAuthorizeUrl((err, url) => {
	if(err) return console.log(err);
	console.log("Auth url is: ", url);
});
 */
