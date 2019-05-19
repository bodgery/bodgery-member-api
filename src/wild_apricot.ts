export interface WAMember
{
    wild_apricot_id: number;
    is_active: boolean;
}

export interface WA
{
    fetch_pending_members(
        success_callback: (members: Array<WAMember>) => void
        ,error_callback: ( err: Error ) => void
    ): void;
}


export class WildApricot
{
    private client_name: string;
    private client_secret: string;
    private account_id: string;


    constructor(
        client_name: string
        ,client_secret: string
        ,account_id: string
    )
    {
        this.client_name = client_name;
        this.client_secret = client_secret;
        this.account_id = account_id;
    }


    public fetch_pending_members(
        success_callback: ( members: Array<WAMember> ) => void
        ,error_callback: ( err: Error ) => void
    ): void
    {
        // TODO
    }
}
