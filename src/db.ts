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

export interface SimpleMember
{
    rfid: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    photo: string;
}

export interface DB
{
    client: any;

    add_member(
        member: SimpleMember
        ,success_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): boolean;

    get_member(
        member_id: string
        ,success_callback: ( member: SimpleMember ) => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean;

    put_member_address(
        member_id: string
        ,address: USAddress
        ,success_callback: () => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean;

    get_member_address(
        member_id: string
        ,success_callback: ( address: USAddress ) => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean;

    set_member_is_active(
        member_id: string
        ,is_active: boolean
        ,success_callback: () => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean;

    get_member_is_active(
        member_id: string
        ,success_callback: ( is_active: boolean ) => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean;

    set_member_rfid(
        member_id: string
        ,rfid: string
        ,success_callback: () => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean;

    get_member_rfid(
        rfid: string
        ,success_callback: () => void
        ,inactive_member_callback: () => void
        ,no_member_found_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): boolean;

    get_password_data_for_user(
        username: string
        ,success_callback: ( stored_data: {
            password: string
            ,crypt_type: string
        }) => void
        ,no_user_found_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): void;

    set_password_data_for_user(
        username: string
        ,new_password: string
        ,new_crypt_method: string
        ,success_callback: () => void
        ,no_user_found_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): void;
/*
    get_members(
        success_callback: ( members: Array<SimpleMember> ) => void
        ,error_callback: ( err: Error ) => void
        ,id: string
        ,limit: number
        ,skip: number
        ,sort: string
    ): boolean;
*/

    end(): void;
}
