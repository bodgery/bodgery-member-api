import * as wa_api from "./wild_apricot";


export class MockWA
{
    private pending_members: Array<wa_api.WAMember>;
    private active_members: Array<wa_api.WAMember>;
    private member_answers: {
        [ member_id: string ]: Array<wa_api.WAMemberAnswers>
    };


    constructor( args: {
        pending?: Array<wa_api.WAMember>
        ,active?: Array<wa_api.WAMember>
        ,member_answers?: {
            [ member_id: string ]: Array<wa_api.WAMemberAnswers>
        }
    })
    {
        this.pending_members = args.pending;
        this.active_members = args.active;
        this.member_answers = args.member_answers;
    }


    public fetch_pending_members(
        success_callback: ( members: Array<wa_api.WAMember> ) => void
        ,error_callback: ( err: Error ) => void
    ): void
    {
        success_callback( this.pending_members );
    }

    public fetch_member_answers(
        member_id: string
        ,success_callback: (answers: Array<wa_api.WAMemberAnswers> ) => void
        ,error_callback: ( err: Error ) => void
    ): void
    {
        success_callback(
            this.member_answers[member_id]
        );
    }
}
