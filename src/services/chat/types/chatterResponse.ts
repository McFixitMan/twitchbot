
export interface ChatterResponse {
    chatter_count: number;
    chatters: {
        broadcaster: Array<string>;
        vips: Array<string>;
        moderators: Array<string>;
        staff: Array<string>;
        admins: Array<string>;
        global_mods: Array<string>;
        viewers: Array<string>;
    }
}