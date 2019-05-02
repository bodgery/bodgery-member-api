import * as crypto from "crypto";
import * as password from "../password";


export class Plaintext
{
    constructor( args: Array<string> )
    {
    }


    crypt(
        key: string
        ,salt: Buffer = password.make_salt()
        ,callback: (string) => void
    ): void
    {
        callback( key );
    }

    isMatch(
        plaintext: string
        ,crypted: string
        ,salt_hex: string
        ,callback: (boolean) => void
    ): void
    {
        let val = password.string_match( plaintext, crypted );
        callback( val );
    }
}
