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

export interface Question
{
    question: string;
    answer: string;
}

enum ToolColor
{
    Green = "green",
    Yellow = "yellow",
    Red = "red",
}

export interface Tool
{
    id: string;
    toolName: string;
    description: string;
    color: ToolColor;
    brand: string;
    model: string;
    serial: string;
    manualUrl: string;
    owner: Member;
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
    profile: Array<Question>;
    approvedTools: Array<Tool>;
}

export interface DB
{
    client: any;

    add_member(
        member: Member
        ,success_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): boolean;

    get_members(
        success_callback: ( members: Array<Member> ) => void
        ,error_callback: ( err: Error ) => void
        ,id: string
        ,limit: number
        ,skip: number
        ,sort: string
    ): boolean;

    end(): void;
}
