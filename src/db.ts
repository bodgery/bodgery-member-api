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
    add_member( member: Member ): boolean;
    get_members(): Array<Member>;
}
