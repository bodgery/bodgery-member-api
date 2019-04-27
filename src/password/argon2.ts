import * as argon from "argon2";


export class Argon2
{
    private hash_len: number;
    private time_cost: number;
    private mem_cost: number;
    private parallelism: number;
    private argon_type = argon.argon2i;


    constructor( args: Array<string> )
    {
        this.hash_len = parseInt( args[0] );
        this.time_cost = parseInt( args[1] );
        this.mem_cost = parseInt( args[2] );
        this.parallelism = parseInt( args[3] );
    }


    crypt(
        password: string
        ,salt: Buffer = Buffer.from( '' )
        ,callback: (string) => void
    ): void
    {
        argon.hash( password, {
            hashLength: this.hash_len
            ,timeCost: this.time_cost
            ,memoryCost: this.mem_cost
            ,parallelism: this.parallelism
            ,type: this.argon_type
        }).then( callback );
    }

    isMatch(
        plaintext: string
        ,crypted: string
        ,salt_hex: string = ""
        ,callback: (boolean) => void
    ): void
    {
        argon.verify( crypted, plaintext ).then( callback );
    }
}
