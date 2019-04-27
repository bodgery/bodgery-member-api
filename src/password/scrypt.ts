import * as crypto from "crypto";
import * as password from "../password";


const KEYLEN = 64;


export class SCrypt
{
    private cost: number;
    private block_size: number;
    private parallelization: number;


    constructor( args: Array<string> )
    {
        this.cost = parseInt( args[0] );
        this.block_size = parseInt( args[1] );
        this.parallelization = parseInt( args[2] );
    }


    crypt(
        key: string
        ,salt: Buffer = password.make_salt()
        ,callback: (string) => void
    ): void
    {
        let salt_hex = salt.toString( 'hex' );
        let result = crypto.scrypt( key, salt_hex, KEYLEN, {
            // Typescript type mapping does not have the options 
            // mapped for 'cost', 'blockSize', or 'parallelization'.
            // Boo this API!
            N: this.cost
            ,r: this.block_size
            ,p: this.parallelization
        }, (err, res) => {
            let str = res.toString( 'hex' );
            callback( str );
        });
    }

    isMatch(
        plaintext: string
        ,crypted: string
        ,salt_hex: string
        ,callback: (boolean) => void
    ): void
    {
        let salt_buf = Buffer.from( salt_hex, 'hex' );
        this.crypt( plaintext, salt_buf, (check_crypted) => {
            let val = password.string_match( check_crypted, crypted );
            callback( val );
        });
    }
}
