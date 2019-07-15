export interface USAddress
{
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
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
}

export interface Member
{
    member_id: string;
    rfid: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
}

export interface DB
{
    add_member(
        member: SimpleMember
        ,success_callback: ( member_id ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean;

    get_member(
        member_id: string
        ,success_callback: ( member: Member ) => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean;

    set_member_photo(
        member_id: string
        ,path: string
        ,success_callback: () => void
        ,no_member_found_callback: ( err: Error ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean;

    get_member_photo(
        member_id: string
        ,success_callback: ( path: string ) => void
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

    put_member_wild_apricot(
        member_id: string
        ,wild_apricot_id: string
        ,success_callback: () => void
        ,no_member_found_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): boolean;

    get_member_wild_apricot(
        member_id: string
        ,success_callback: ( wild_apricot_id: string ) => void
        ,no_member_found_callback: () => void
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
        ,no_member_found_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): boolean;

    get_member_rfid(
        rfid: string
        ,success_callback: () => void
        ,inactive_member_callback: () => void
        ,no_member_found_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): boolean;

    rfid_dump(
        success_callback: ( dump: any ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean;

    log_rfid_entry(
        rfid: string
        ,is_active: boolean
        ,success_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): boolean;

    add_user(
        username: string
        ,password: string
        ,salt: string
        ,crypt_type: string
        ,success_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): void;

    get_password_data_for_user(
        username: string
        ,success_callback: ( stored_data: {
            password: string
            ,crypt_type: string
            ,salt: string
        }) => void
        ,no_user_found_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): void;

    set_password_data_for_user(
        username: string
        ,new_password: string
        ,new_crypt_method: string
        ,salt: string
        ,success_callback: () => void
        ,no_user_found_callback: () => void
        ,error_callback: ( err: Error ) => void
    ): void;

    session_store( express_session );

    get_members(
        offset: number
        ,per_page: number
        ,success_callback: ( members: Array<Member> ) => void
        ,error_callback: ( err: Error ) => void
    ): boolean;

    end(): void;
}
