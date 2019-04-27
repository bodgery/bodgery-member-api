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
    ): string
    {
        let salt_hex = salt.toString( 'hex' );
        let result = crypto.scryptSync( key, salt_hex, KEYLEN, {
            // Typescript type mapping does not have the options 
            // mapped for 'cost', 'blockSize', or 'parallelization'.
            // Boo this API!
            N: this.cost
            ,r: this.block_size
            ,p: this.parallelization
        });
        return result.toString( 'hex' );
    }

    isMatch(
        plaintext: string
        ,crypted: string
        ,salt_hex: string
    ): boolean
    {
        let salt_buf = Buffer.from( salt_hex, 'hex' );
        let check_crypted = this.crypt( plaintext, salt_buf );
        return password.string_match( check_crypted, crypted );
    }
}
