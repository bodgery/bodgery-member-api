
function get_token( req )
{
    let auth_header = req.header( 'Authorization' ) || "";
    let tokens = auth_header.split( ' ' );
    let token = tokens[1];
    return token;
}

export function session_authorization( logger )
{
    return (req, res, next ) => {
        const route = req.path;

        const not_allowed = () => {
            logger.error( "User not allowed to access " + route );
            res.sendStatus(401);
        };

        logger.info( "Checking user authorization" );
        // Eventually, we'll have more sophisticated checking for users 
        // accessing individual routes, but for now, any logged in user can 
        // access anything
        if( req.session.is_logged_in ) {
            logger.info( "User is logged in, allowing" );
            next();
        }
        // Tests can set an env var to bypass this check
        // TODO remove
        else if( process.env['TEST_RUN'] ) {
            logger.info( "Server in test run mode, allowing" );
            next();
        }
        // Everything else is not allowed
        else {
            not_allowed();
        }
    };
}

export function bearer_authorization( logger, db )
{
    return (req, res, next ) => {
        const route = req.path;
        const token = get_token( req );

        const not_allowed = () => {
            logger.error( "User not allowed to access " + route );
            res.sendStatus(401);
        };

        logger.info( "Checking user authorization" );
        // Bearer tokens
        if( token != undefined ) {
            db.is_token_allowed( token
                ,() => {
                    logger.info( "Bearer token is allowed" );
                    next();
                }
                ,() => {
                    logger.info( "Bearer token is NOT allowed" );
                    not_allowed();
                }
                ,( err: Error ) => {
                    throw err;
                }
            );
        }
        // Tests can set an env var to bypass this check
        // TODO remove
        else if( process.env['TEST_RUN'] ) {
            logger.info( "Server in test run mode, allowing" );
            next();
        }
        // Everything else is not allowed
        else {
            not_allowed();
        }
    };
}
