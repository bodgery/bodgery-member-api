export interface USAddress
{
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    county: string;
    country: string;
}

export interface Member
{
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    address: USAddress;
    photo: string;
    phone: string;
    // TODO
    profile: Array<string>;
    // TODO
    approvedTools: Array<string>;
}

export interface DB
{
    add_member(
        member: Member
        ,success_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): boolean;

    get_members(
        success_callback: ( members: Array<Member> ) => void
        error_callback: ( err: Error ) => void
    ): boolean;
}
