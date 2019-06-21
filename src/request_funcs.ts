import * as c from "./context";
import * as email_sender from "./email_sender";
import * as Tokens from "csrf";
import * as db_impl from "./db";
import * as fs from "fs";
import * as google from 'googleapis';
import * as google_auth from 'google-auth-library';
import * as shortid from "shortid";
import * as valid from "./validation";
import * as wa_api from "./wild_apricot";


let db : db_impl.DB;
export function set_db (new_db: db_impl.DB)
{
    db = new_db;
}

function get_generic_db_error( logger, res )
{
    return ( err: Error ) => {
        logger.error( "Error writing to database: " + err.toString() );
        res
            .status( 500 )
            .end();
    };
}

function get_member_id_not_found_error( logger, res, member_id )
{
    return () => {
        logger.info( "No member found for RFID " + member_id );
        res
            .status( 404 )
            .end();
    };
}

function handle_generic_validation_error( logger, res, err ): void
{
    logger.error( "Errors: " + err.toString() );
    res
        .status( 400 )
        .json({
            error: err.toString()
        });
}

function fetch_google_auth(
    conf
    ,scopes: Array<string>
    ,callback: ( client ) => void
): void
{
    fs.readFile( conf.google_credentials_file, (err, data) => {
        if(err) throw err;
        let keys = JSON.parse( data.toString() );

        let auth = new google_auth.OAuth2Client(
            keys.installed.client_id
            ,keys.installed.client_secret
            ,keys.installed.redirect_uris[0]
        );

        auth.setCredentials({
            access_token: conf.google_access_token
            ,refresh_token: conf.google_refresh_token
            ,expiry_date: conf.google_expires_date
        });
        callback( auth );
    });
}

function fetch_google_email_scopes(): Array<string>
{
    return [
        'https://mail.google.com/'
        ,'https://www.googleapis.com/auth/gmail.modify'
        ,'https://www.googleapis.com/auth/gmail.compose'
        ,'https://www.googleapis.com/auth/gmail.send'
    ];
}

function fetch_google_group_scopes(): Array<string>
{
    return [
        'https://www.googleapis.com/auth/admin.directory.group'
        ,'https://www.googleapis.com/auth/admin.directory.group.member',
    ];
}


export function get_versions ( req, res, ctx: c.Context )
{
    res
        .status(200)
        .json([ '/v1' ]);
}

export function put_member( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    let body = req.body;
    try {
        valid.validate( body, [
            valid.isInteger( 'rfid' )
            ,valid.isName( 'firstName' )
            ,valid.isName( 'lastName' )
            ,valid.isUSPhone( 'phone' )
            ,valid.isPublicEmail( 'email' )
         ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    db.add_member( body
        ,() => {
            logger.info( "Member added successfully" );
            res
                .status( 204 )
                .end();
        }
        ,get_generic_db_error( logger, res )
    );
}

export function get_member( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    try {
        valid.validate( req.params, [
            valid.isInteger( 'member_id' )
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    let member_id = req.params.member_id;

    db.get_member( member_id
        ,( member: db_impl.SimpleMember ) => {
            logger.info( "Fetched member" );
            res
                .status( 200 )
                .send( member )
                .end();
        }
        ,get_member_id_not_found_error( logger, res, member_id )
        ,get_generic_db_error( logger, res )
    );
}

export function put_member_address( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    let body = req.body;

    try {
        valid.validate( req.params, [
            valid.isInteger( 'member_id' )
        ]);
        valid.validate( body, [
            valid.isUSAddress()
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    let member_id = req.params.member_id;

    db.put_member_address( member_id, body
        ,() => {
            logger.info( "Address set on member successfully" );
            res
                .status( 204 )
                .end();
        }
        ,get_member_id_not_found_error( logger, res, member_id )
        ,get_generic_db_error( logger, res )
    );
}

export function get_member_address( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    try {
        valid.validate( req.params, [
            valid.isInteger( 'member_id' )
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    let member_id = req.params.member_id;

    db.get_member_address( member_id
        ,( address: db_impl.USAddress ) => {
            logger.info( "Fetched member address" );
            res
                .status( 200 )
                .send( address )
                .end();
        }
        ,get_member_id_not_found_error( logger, res, member_id )
        ,get_generic_db_error( logger, res )
    );
}

export function put_member_is_active( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    try {
        valid.validate( req.params, [
            valid.isInteger( 'member_id' )
        ]);
        valid.validate( req.body, [
            valid.isBoolean( 'is_active' )
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }


    let member_id = req.params.member_id;
    let is_active = req.body.is_active;
    ctx.wa.set_member_active(
        member_id, is_active
        ,() => {
            db.set_member_is_active( member_id, is_active
                ,() => {
                    logger.info( "Set is active: " + is_active );
                    res
                        .status( 200 )
                        .send()
                        .end();
                }
                ,get_member_id_not_found_error( logger, res, member_id )
                ,get_generic_db_error( logger, res )
            );
        },
        ( err: Error ) => {
            logger.error( "Error calling Wild Apricot: " + err.toString() );
        }
    );
}

export function get_member_is_active( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    try {
        valid.validate( req.params, [
            valid.isInteger( 'member_id' )
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    let member_id = req.params.member_id;
    db.get_member_is_active( member_id
        ,(is_active: boolean) => {
            logger.info( "Set is active: " + is_active );
            res
                .status( 200 )
                .send( is_active )
                .end();
        }
        ,get_member_id_not_found_error( logger, res, member_id )
        ,get_generic_db_error( logger, res )
    );
}

export function put_member_rfid( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    try {
        valid.validate( req.params, [
            valid.isInteger( 'member_id' )
        ]);
        valid.validate( req.body, [
            valid.isInteger( 'rfid' )
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }


    let member_id = req.params.member_id;
    let rfid = req.body.rfid;
    db.set_member_rfid( member_id, rfid
        ,() => {
            // Don't put RFID in log
            logger.info( "Set RFID on member " + member_id );
            res
                .status( 200 )
                .send()
                .end();
        }
        ,get_member_id_not_found_error( logger, res, member_id )
        ,get_generic_db_error( logger, res )
    );
}

export function get_member_rfid( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    try {
        valid.validate( req.params, [
            valid.isInteger( 'rfid' )
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    let rfid = req.params.rfid;
    db.get_member_rfid( rfid
        ,() => {
            // Don't put RFID tag in log
            logger.info( "RFID check OK" );
            res
                .status( 200 )
                .send()
                .end();
        }
        ,() => {
            logger.info( "RFID is inactive for RFID check" );
            res
                .status( 403 )
                .send()
                .end();
        }
        ,() => {
            logger.info( "RFID is not found for check" );
            res
                .status( 404 )
                .send()
                .end();
        }
        ,get_generic_db_error( logger, res )
    );
}

export function put_member_wildapricot( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    let body = req.body;

    try {
        valid.validate( req.params, [
            valid.isInteger( 'member_id' )
        ]);
        valid.validate( body, [
            valid.isInteger( 'wild_apricot_id' )
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    let member_id = req.params.member_id;
    let wild_apricot_id = body.wild_apricot_id;

    db.put_member_wild_apricot( member_id, wild_apricot_id
        ,() => {
            logger.info( "Wild Apricot ID set on member successfully" );
            res
                .status( 204 )
                .end();
        }
        ,get_member_id_not_found_error( logger, res, member_id )
        ,get_generic_db_error( logger, res )
    );
}

export function put_member_google_group( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    let body = req.body;

    try {
        valid.validate( req.params, [
            valid.isInteger( 'member_id' )
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    let member_id = req.params.member_id;

    db.get_member( member_id
        ,( member_data ) => {
            const email = member_data.email;

            fetch_google_auth(
                ctx.conf
                ,fetch_google_group_scopes()
                ,( auth ) => {
                    const groups = new google.admin_directory_v1.Admin({
                        auth: auth
                    });

                    let promises = ctx.conf['google_groups_signup_list'].map(
                        (_) => {
                            return new Promise( (resolve, reject) => {
                                groups.members.insert({
                                    groupKey: _
                                    ,requestBody: {
                                        email: email
                                    }
                                }).then( resolve );
                            });
                        }
                    );

                    Promise
                        .all( promises )
                        .then( () => {
                            logger.info( "Signed up for Google Groups" );
                            res
                                .status( 200 )
                                .end();
                        });
                }
            );
        }
        ,get_member_id_not_found_error( logger, res, member_id )
        ,get_generic_db_error( logger, res )
    );
}

export function login_user( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    try {
        valid.validate( req.body, [
            valid.isPublicEmail( 'username' )
            // Password field is allowed to be anything
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    let username = req.body.username;
    let password = req.body.password;

    let is_match_callback = () => {
        logger.info( "User " + username + " logged in successfully" );
        req.session.username = username;
        req.session.is_logged_in = true;

        let render = tmpl_view( "login", {
            user: username
        }, [], 200 );
        render( req, res, ctx );
    };

    let is_not_match_callback = () => {
        logger.info( "User " + username + " failed to login" );

        let render = tmpl_view( "home", {}, [
            "Invalid username or password"
        ], 403);
        render( req, res, ctx );
    };

    let checker = ctx.password_checker;
    checker.isMatch({
        username: username
        ,passwd: password
        ,is_match_callback: is_match_callback
        ,is_not_match_callback: is_not_match_callback
    });
}

export function logout_user( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    let username = req.session.username;
    let is_logged_in = req.session.is_logged_in;

    if( is_logged_in ) {
        logger.info( "Username " + username + " is logging out" );
        req.session.destroy( () => {
            res
                .status( 200 )
                .render( "home" );
        });
    }
    else {
        logger.info( "Asked for logout, but is not logged in" );
        res
            .status( 403 )
            .render( "home", {
                errors: [
                    "Not logged in, so you can't log out"
                ]
            });
    }
}

export function is_user_logged_in( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    let username = req.session.username;
    let is_logged_in = req.session.is_logged_in;

    if(! req.session.check_login) req.session.check_login = 0;
    req.session.check_login += 1;

    logger.info( "Username [" + username + "], checking logged in setting"
        + ", which is " + is_logged_in );

    res
        .status( is_logged_in ? 200 : 403 )
        .send({ username: username })
        .end();
}

export function get_members_pending( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    let wa = ctx.wa;

    let success_callback = ( members: Array<wa_api.WAMember> ) => {
        logger.info( "Fetched pending members from Wild Apricot" );
        res
            .status( 200 )
            .send( members )
            .end();
    };

    let error_callback = ( err: Error ) => {
        logger.error( "Could not fetch pending members from Wild Apricot: "
            + err.toString() );
        res
            .status( 500 )
            .send( "Error fetching data from Wild Apricot" )
            .end();
    };

    wa.fetch_pending_members(
        success_callback
        ,error_callback
    );
}

export function member_signup( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    try {
        valid.validate( req.query, [
            valid.isInteger( 'wa_id' )
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    let wa_id = req.query['wa_id'];
    // TODO fetch full member data from WA

    let render = tmpl_view( "member-signup", {
        name: null
        ,wa_id: wa_id
    }, [], 200 );
    render( req, res, ctx );
}

export function post_member_signup_email( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    try {
        valid.validate( req.params, [
            valid.isInteger( 'member_id' )
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    let member_id = req.params['member_id'];

    db.get_member( member_id
        ,(member) => {
            let to_name = member.firstName + " " + member.lastName;
            let to_email = member.email;

            let auth = fetch_google_auth(
                ctx.conf
                ,fetch_google_email_scopes()
                ,( google_client ) => {
                    let sender = new email_sender.Email({
                        auth: google_client
                    });
                    sender.init( () => {
                        sender.send_new_member_signup({
                            to_name: to_name
                            ,to_email: to_email
                            ,from_name: ctx.conf['email_new_member_signup_from_name']
                            ,from_email: ctx.conf['email_new_member_signup_from_email']
                            ,success_callback: () => {
                                logger.info( "New member signup email sent" );
                                res
                                    .status( 200 )
                                    .end();
                            }
                            ,error_callback: ( err: Error ) => {
                                logger.error( "Error sending new member email: "
                                    + err.toString() );
                                res
                                    .status( 500 )
                                    .end();
                            }
                        });
                    });
                }
            );
        }
        ,get_member_id_not_found_error( logger, res, member_id )
        ,get_generic_db_error( logger, res )
    );
}

export function post_group_member_signup_email( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    try {
        valid.validate( req.params, [
            valid.isInteger( 'member_id' )
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    let member_id = req.params['member_id'];

    let send_email = (
        first_name: string,
        photo_path: string,
        answers: Array<wa_api.WAMemberAnswers>
    ) => {
        let auth = fetch_google_auth(
            ctx.conf
            ,fetch_google_email_scopes()
            ,( google_client ) => {
                let sender = new email_sender.Email({
                    auth: google_client
                });
                sender.init( () => {
                    sender.send_new_group_member_signup({
                        to_name: ctx.conf['email_group_new_member_signup_to_name']
                        ,to_email: ctx.conf['email_group_new_member_signup_to_email']
                        ,from_name: ctx.conf['email_new_member_signup_from_name']
                        ,from_email: ctx.conf['email_new_member_signup_from_email']
                        ,member_first_name: first_name
                        ,photo_path: photo_path
                        ,answers: answers
                        ,success_callback: () => {
                            logger.info( "New member signup email sent" );
                            res
                                .status( 200 )
                                .end();
                        }
                        ,error_callback: ( err: Error ) => {
                            logger.error( "Error sending new member email: "
                                + err.toString() );
                            res
                                .status( 500 )
                                .end();
                        }
                    });
                });
            }
        );
    };

    ctx.wa.fetch_member_answers( member_id
        ,( member_answers: Array<wa_api.WAMemberAnswers> ) => {
            db.get_member( member_id
                ,(member) => {
                    db.get_member_photo(
                        member_id
                        ,(photo_path) => {
                            send_email(
                                member.firstName
                                ,photo_path
                                ,member_answers
                            );
                        }
                        ,get_member_id_not_found_error( logger, res, member_id )
                        ,get_generic_db_error( logger, res )
                    );
                }
                ,get_member_id_not_found_error( logger, res, member_id )
                ,get_generic_db_error( logger, res )
            );
        }
        ,( err: Error ) => {
            logger.error( "Error fetching member answers from Wild Apricot: "
                + err.toString() );
        }
    );
}

export function put_member_photo( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    try {
        valid.validate( req.params, [
            valid.isInteger( 'member_id' )
        ]);
        valid.validate( req.body, [
            valid.byteLengthLimit( ctx.conf['photo_size_limit'] )
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    let member_id = req.params['member_id'];
    let path = ctx.conf['photo_dir'] + "/" + shortid.generate();

    let promises = [
        new Promise( (resolve, reject) => fs.writeFile(
            path
            ,res.body
            ,(err) => {
                if( err ) reject( err );
                else resolve();
            })
        )
        ,new Promise( (resolve, reject) => db.set_member_photo(
            member_id
            ,path
            ,resolve
            ,(err) => reject( err )
            ,(err) => reject( err )
        ) )
    ];

    Promise.all( promises ).then( () => {
        res
            .status( 204 )
            .end();
    });
}

export function get_member_photo( req, res, ctx: c.Context )
{
    let logger = ctx.logger;
    try {
        valid.validate( req.params, [
            valid.isInteger( 'member_id' )
        ]);
    }
    catch (err) {
        handle_generic_validation_error( logger, res, err );
        return;
    }

    let member_id = req.params.member_id;
    db.get_member_photo( member_id
        ,(path: string) => {
            fs.realpath( path, ( err, real_path ) => {
                logger.info( "Member photo: " + real_path );
                res
                    .status( 200 )
                    // TODO set content type based on image
                    .set( 'Content-Type', 'image/jpeg' )
                    .sendFile( real_path );
            });
        }
        ,get_member_id_not_found_error( logger, res, member_id )
        ,get_generic_db_error( logger, res )
    );
}

// No longer use this alternative method to fetch the OAuth2 ID from Google, 
// but keep it around just in case.
/*
export function google_oauth( req, res, ctx: c.Context )
{
    let logger = ctx.logger;

    // TODO authenticate that this is actually coming from Google
    let token = req.query['code'];
    let token_file = ctx.conf['google_oauth_token_path'];

    let data = new Uint8Array( Buffer.from( token ) );
    fs.writeFile( token_file, data, (err) => {
        if( err ) {
            logger.error( "Error writing Google OAuth token to "
                + token_file + ": " + err.toString() );
            res
                .status( 500 )
                .end();
        }
        else {
            logger.info( "Wrote new Google OAuth token to " + token_file );
            res
                .status( 200 )
                .end();
        }
    });
}
*/

export function tmpl_view(
    view: string
    ,args = {}
    ,errors = []
    ,status_code = 200
)
{
    return ( req, res, ctx: c.Context ) => {
        ctx.logger.info( "Rendering view: " + view );

        let tokens = new Tokens();
        let csrf_token = tokens.create( req.session.csrf_secret );
        args["csrf"] = csrf_token;

        res
            .status( status_code )
            .render( view, args );
    };
}
