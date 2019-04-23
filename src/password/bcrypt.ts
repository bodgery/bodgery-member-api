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
    ): string
    {
        return bcrypt.hashSync( password, this.rounds );
    }

    isMatch(
        plaintext: string,
        crypted: string
    ): boolean
    {
        return bcrypt.compareSync( plaintext, crypted );
    }
}
