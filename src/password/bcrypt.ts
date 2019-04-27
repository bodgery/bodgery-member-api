import * as bcrypt from "bcrypt";


export class BCrypt
{
    private rounds: number;


    constructor( args: Array<string> )
    {
        this.rounds = parseInt( args[0] );
    }


    crypt(
        password: string
        ,salt: Buffer = Buffer.from( '' )
        ,callback: (string) => void
    ): void
    {
        bcrypt.hash( password, this.rounds,
            (err, hash) => callback( hash ) );
    }

    isMatch(
        plaintext: string
        ,crypted: string
        ,salt_hex: string = ""
        ,callback: (boolean) => void
    ): void
    {
        bcrypt.compare( plaintext, crypted,
            (err, res) => callback(res) );
    }
}
