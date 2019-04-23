import * as db from "./db";
import * as bcrypt from "./password/bcrypt";


export interface Crypter
{
    crypt(
        password: string
    ): string;
    isMatch(
        plaintext: string
        ,crypted: string
    ): boolean;
}

export class DefaultStringMatch
{
}

export class Checker
{
    private db: db.DB;
    private preferred_method: Crypter;
    private preferred_method_str: string;


    constructor( 
        preferred_method: string
        ,db: db.DB
    )
    {
        this.db = db;

        let preferred = this._parseCryptType( preferred_method );
        this.preferred_method_str = preferred_method;
        this.preferred_method = preferred;
    }


    public isMatch( args: {
        username: string
        ,passwd: string
        ,is_match_callback: () => void
        ,is_not_match_callback: () => void
    }): void
    {
        let username = args.username;
        let passwd = args.passwd;
        let is_match_callback = args.is_match_callback;
        let is_not_match_callback = args.is_not_match_callback;

        let success_callback = (stored_data) => {
            let stored_password = stored_data.password;
            let stored_crypt_type = stored_data.crypt_type;
            let crypter = this._parseCryptType( stored_crypt_type );

            let is_matched = crypter.isMatch( passwd,
                stored_password );

            if( is_matched
                && (stored_crypt_type == this.preferred_method_str)) {
                is_match_callback();
            }
            else if( is_matched ) {
                // Matched fine, but we aren't using the preferred method of
                // password encryption, so reencrypt
                let new_crypt_password = this.preferred_method.crypt( passwd );
                this.db.set_password_data_for_user(
                    username
                    ,new_crypt_password
                    ,this.preferred_method_str
                    ,is_match_callback
                    ,() => {
                        // How did we get to a 'no user found' error
                        // when we already checked it? DB interface 
                        // would likely be buggy if we get here.
                        is_not_match_callback();
                    }
                    ,( err: Error ) => {
                        throw err;
                    }
                );
            }
            else {
                is_not_match_callback();
            }
        };

        this.db.get_password_data_for_user(
            username
            ,success_callback
            ,() => {
                is_not_match_callback();
            }
            ,( err: Error ) => {
                throw err;
            }
        );
    }


    private _isStringsEqual( str1: string, str2: string ): boolean
    {
        if( str1.length != str2.length ) return false;

        // Constant time string eq algorithm. Do not return until 
        // entire string is matched
        let str2_chars = str2.split('');
        let is_match = true;

        str1.split('').forEach( (val, i) => {
            if( val != str2_chars[i] ) is_match = false;
        });

        return is_match;
    }

    private _parseCryptType( crypt_string: string ): Crypter
    {
        let parts = crypt_string.split( '_' );
        if( parts.length < 1 ) {
            throw new Error( "Error parsing crypt string ('"
                + crypt_string + "')" );
        }

        let crypt_type = parts[0];
        let crypt_args = parts.slice(1);

        let crypter = this._fetchCrypterByName( crypt_type, crypt_args );
        return crypter;
    }

    private _fetchCrypterByName(
        crypt_type: string
        ,crypt_args: Array<string>
    ): Crypter
    {
        let crypter: Crypter;

        switch( crypt_type ) {
            case 'bcrypt':
                crypter = new bcrypt.BCrypt( crypt_args );
                break;
            default:
                throw new Error( "Unknown crypter type: " + crypt_type );
        }

        return crypter;
    }
}
