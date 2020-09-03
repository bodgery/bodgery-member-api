import * as googleAuth from 'google-auth-library';
import {Credentials} from 'google-auth-library/build/src/auth/credentials';
import * as fs from 'fs';
import * as readline from 'readline';

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
    'https://www.googleapis.com/auth/admin.directory.group.member',
    'https://www.googleapis.com/auth/admin.directory.group',
    'https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send',
];

/**
 * Step 0: Create OAuth2 credentials at the Google Console (make sure to download JSON, not only just get key and secret)
 */

/**
 * Step 1: Authorize in the browser
 */

export function getAuthorizeUrl(
    credentials,
    callback: (err: any, url: string) => any,
): void {
    const oauth2Client = new googleAuth.OAuth2Client(
        credentials.installed.client_id,
        credentials.installed.client_secret,
        credentials.installed.redirect_uris[0],
    );

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });

    callback(null, authUrl);
}

/**
 * Step 2: Get auth token
 */

export function getAccessToken(
    code,
    credentials,
    callback: (err: any, token?: Credentials | null) => any,
): void {
    const oauth2Client = new googleAuth.OAuth2Client(
        credentials.installed.client_id,
        credentials.installed.client_secret,
        credentials.installed.redirect_uris[0],
    );

    oauth2Client.getToken(code, (err, token) => {
        if (err) return console.log(err);

        callback(null, token);
    });
}

fs.readFile('google-credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    let credentials = JSON.parse(content.toString());

    getAuthorizeUrl(credentials, (err, url) => {
        if (err) return console.log(err);
        console.log('Auth url is: ', url);

        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question('Input token: ', token => {
            getAccessToken(token, credentials, (err, access) => {
                if (err) return console.log(err);
                //console.log("Auth token is: ", token);
                console.log('google_client_token: ' + token);
                console.log('google_access_token: ' + access['access_token']);
                console.log('google_token_type: ' + access['token_type']);
                console.log('google_refresh_token: ' + access['refresh_token']);
                console.log('google_expires_date: ' + access['expiry_date']);
            });
        });
    });
});
