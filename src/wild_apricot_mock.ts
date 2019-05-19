import * as wa_api from "./wild_apricot";


export class MockWA
{
    private pending_members: Array<wa_api.WAMember>;
    private active_members: Array<wa_api.WAMember>;


    constructor( args: {
        pending: Array<number>
        ,active: Array<number>
    })
    {
        this.pending_members = args.pending.map( (_) => { return {
            wild_apricot_id: _
            ,is_active: false
        }});
        this.active_members = args.active.map( (_) => { return {
            wild_apricot_id: _
            ,is_active: true
        }});
    }


    public fetch_pending_members(
        success_callback: ( members: Array<wa_api.WAMember> ) => void
        ,error_callback: ( err: Error ) => void
    ): void
    {
        success_callback( this.pending_members );
    }
}
