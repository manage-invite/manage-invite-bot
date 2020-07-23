module.exports = class Member {
    constructor(handler, { userID, guildID, data, invitedMembers, invitedMemberEvents }) {

        this.userID = userID;
        this.guildID = guildID;

        this.handler = handler;
        this.handler.memberCache.set(`${this.userID}${this.guildID}`, this);

        // Member invites
        this.fake = data.invites_fake || 0;
        this.leaves = data.invites_leaves || 0;
        this.bonus = parseInt(data.invites_bonus) || 0;
        this.regular = data.invites_regular || 0;

        // Old member invites
        this.oldFake = data.old_invites_fake || 0;
        this.oldLeaves = data.old_invites_leaves || 0;
        this.oldBonus = parseInt(data.old_invites_bonus) || 0;
        this.oldRegular = data.old_invites_regular || 0;
        this.oldBackuped = data.old_invites_backuped || false;

        const formatEvent = (eventData) => {
            return {
                userID: eventData.user_id,
                guildID: eventData.guild_id,
                eventType: eventData.event_type,
                eventDate: new Date(eventData.event_date).getTime(),
                joinType: eventData.join_type,
                inviterID: eventData.inviter_user_id,
                inviteData: eventData.invite_data
            };
        };

        // Array of invited_member_events where inviter_id is equal to the member ID and guild_id is equal to member guild id
        this.invitedMembers = invitedMembers.map(invitedMemberData => formatEvent(invitedMemberData));
        // Array of invited_member_events objects where user_id is equal to the member ID and guild_id is equal to member guild id
        this.invitedMemberEvents = invitedMemberEvents.map(invitedMemberEvent => formatEvent(invitedMemberEvent));

    }

    get joinData() {
        return this.invitedMemberEvents
            .filter((e) => e.eventType === "join")
            .sort((a, b) => b.eventDate - a.eventDate)[0];
    }

    get calculatedInvites(){
        return this.regular + this.bonus - this.leaves - this.fake;
    }

    // Update member invites
    async updateInvites() {
        await this.handler.query(`
            UPDATE members
            
            SET invites_fake = ${this.fake},
            invites_leaves = ${this.leaves},
            invites_bonus = ${this.bonus},
            invites_regular = ${this.regular},
            old_invites_fake = ${this.oldFake},
            old_invites_leaves = ${this.oldLeaves},
            old_invites_bonus = ${this.oldBonus},
            old_invites_regular = ${this.oldRegular},
            old_invites_backuped = ${this.oldBackuped}
            
            WHERE user_id = '${this.userID}'
            AND guild_id = '${this.guildID}';
        `);
        this.handler.removeMemberFromOtherCaches(this.userID, this.guildID);
        return;
    }

};