const { Collection } = require("discord.js");

module.exports = class Member {
    constructor(handler, { userID, guildID, joinData, invitedUsers, invitedUsersLeft }) {

        this.id = userID;
        this.guildID = guildID

        this.handler = handler;
        this.handler.memberCache.set(this.id, this);

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

        this.invitedUsers = this.invitedUsers.map(invitedUserData => invitedUserData.invited_user_id);
        this.invitedUsersLeft = this.invitedUsersLeft.map(invitedUserData => invitedUserData.invited_user_id);

        this.joinData = {
            type: joinData.join_type,
            inviterID: joinData.join_inviter_id,
            inviteData: joinData.join_invite_data
        };

    }

    calcInvites(){
        return this.regular + this.bonus - this.leaves - this.fake;
    }

    // Add invited user
    async addInvitedUser(userID){
        await this.handler.query(`
            INSERT INTO member_invited_users
            (user_id, guild_id, invited_user_id) VALUES
            ('${this.id}', '${this.guildID}', '${userID}');
        `);
        this.handler.removeMemberFromOtherCaches(this.id, this.guildID);
        this.invitedUsers.push(userID);
        return;
    }

    // Remove invited user
    async removeInvitedUser(userID){
        await this.handler.query(`
            DELETE FROM member_invited_users
            WHERE user_id = '${this.id}'
            AND guild_id = '${this.id}'
            AND invited_user_id = '${userID}';
        `);
        this.handler.removeMemberFromOtherCaches(this.id, this.guildID);
        this.invitedUsers = this.invitedUsers.filter((id) => id !== userID);
        if(this.editOnly) this.handler.removeMemberFromCache(this.id, this.guildID);
        return;
    }

    // Add invited user left
    async addInvitedUserLeft(userID){
        await this.handler.query(`
            INSERT INTO member_invited_users_left
            (user_id, guild_id, invited_user_id) VALUES
            ('${this.id}', '${this.guildID}', '${userID}');
        `);
        this.handler.removeMemberFromOtherCaches(this.id, this.guildID);
        this.invitedUsersLeft.push(userID);
        if(this.editOnly) this.handler.removeMemberFromCache(this.id, this.guildID);
        return;
    }

    // Remove invited user left
    async removeInvitedUserLeft(userID){
        await this.handler.query(`
            DELETE FROM member_invited_users_left
            WHERE user_id = '${this.id}'
            AND guild_id = '${this.id}'
            AND invited_user_id = '${userID}';
        `);
        this.handler.removeMemberFromOtherCaches(this.id, this.guildID);
        this.invitedUsersLeft = this.invitedUsersLeft.filter((id) => id !== userID);
        if(this.editOnly) this.handler.removeMemberFromCache(this.id, this.guildID);
        return;
    }

    // Set member join data
    async setJoinData(data){
        if(this.joinData){
            await this.handler.query(`
                UPDATE member_join_data
                SET join_type = '${data.type}'
                ${data.inviterID ? `, join_inviter_id = '${data.inviterID}'` : ""}
                ${data.inviteData ? `, join_invite_data = '${JSON.stringify(data.inviteData)}'` : ""}
                WHERE user_id = '${this.id}'
                AND guild_id = '${this.guildID}';
            `);
        } else {
            await this.handler.query(`
                INSERT INTO member_join_data
                (user_id, guild_id, join_type ${data.inviterID ? ", join_inviter_id" : ""} ${data.inviteData ? ", join_invite_data" : ""}) VALUES
                ('${this.id}', '${this.guildID}', '${data.type}' ${data.inviterID ? `, '${data.inviterID}'` : ""} ${data.inviteData ? `, '${JSON.stringify(data.inviteData)}'` : ""})
            `);
        }
        this.handler.removeMemberFromOtherCaches(this.id, this.guildID);
        this.joinData = {
            type: data.type,
            inviterID: data.inviterID,
            inviteData: data.inviteData
        };
        if(this.editOnly) this.handler.removeMemberFromCache(this.id, this.guildID);
        return;
    }

    // Clear member join data
    async clearJoinData(){
        await this.handler.query(`
            DELETE FROM member_join_data
            WHERE user_id = '${this.id}'
            AND guild_id = '${this.guildID}';
        `);
        this.handler.removeMemberFromOtherCaches(this.id, this.guildID);
        this.joinData = null;
        if(this.editOnly) this.handler.removeMemberFromCache(this.id, this.guildID);
    }

    // Update member invites
    async updateInvites() {
        if(!this.inserted) this.insert();
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
            
            WHERE user_id = '${this.id}'
            AND guild_id = '${this.guildID}';
        `);
        this.handler.removeMemberFromOtherCaches(this.id, this.guildID);
        if(this.editOnly) this.handler.removeMemberFromCache(this.id, this.guildID);
        return;
    }

};