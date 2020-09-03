import * as wa_api from './wild_apricot';

export interface MockWAMembers {
    is_active: boolean;
}

export class MockWA {
    private pending_members: Array<wa_api.WAMember>;
    private active_members: Array<wa_api.WAMember>;
    private member_answers: {
        [member_id: string]: Array<wa_api.WAMemberAnswers>;
    };
    public members: {
        [member_id: string]: MockWAMembers;
    };

    constructor(args: {
        pending?: Array<wa_api.WAMember>;
        active?: Array<wa_api.WAMember>;
        member_answers?: {
            [member_id: string]: Array<wa_api.WAMemberAnswers>;
        };
        members?: {
            [member_id: string]: MockWAMembers;
        };
    }) {
        this.pending_members = args.pending;
        this.active_members = args.active;
        this.member_answers = args.member_answers;
        this.members = args.members;
    }

    public fetch_pending_members(
        success_callback: (members: Array<wa_api.WAMember>) => void,
        error_callback: (err: Error) => void,
    ): void {
        success_callback(this.pending_members);
    }

    public fetch_member_answers(
        member_id: string,
        success_callback: (answers: Array<wa_api.WAMemberAnswers>) => void,
        error_callback: (err: Error) => void,
    ): void {
        success_callback(this.member_answers[member_id]);
    }

    public set_member_active(
        member_id: string,
        success_callback: () => void,
        error_callback: (err: Error) => void,
    ): void {
        this.members[member_id].is_active = true;
        success_callback();
    }

    public set_member_inactive(
        member_id: string,
        success_callback: () => void,
        error_callback: (err: Error) => void,
    ): void {
        this.members[member_id].is_active = false;
        success_callback();
    }

    public fetch_member_data(
        wa_member_id: number,
        success_callback: (member: wa_api.WAMember) => void,
        error_callback: (err: Error) => void,
    ): void {
        let member = this.members[wa_member_id];
        success_callback({
            first_name: 'Johnson',
            last_name: 'McHuman',
            email: 'foo@example.com',
            phone: '555 555 1234',
            wild_apricot_id: wa_member_id,
            is_active: member.is_active,
        });
    }

    public fetch_all_members(
        success_callback: (members: Array<wa_api.WAMember>) => void,
        error_callback: (err: Error) => void,
    ): void {
        success_callback(this.pending_members);
    }
}
