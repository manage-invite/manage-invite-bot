const { Collection } = require("discord.js");

module.exports = class Member {
    constructor(userID, guildID, data, handler) {
        if(!data) data = {};
        this.id = userID;
        this.guildID = guildID
        this.handler = handler;
        this.inserted = Object.keys(data).length !== 0;
        this.data = data;
        // Whether the member is fetched
        this.fetched = false;
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
    }

    async fetch() {
        if (this.fetched) return;
        this.joinData = null;
        await this.fetchJoinData();
        this.invitedUsers = [];
        await this.fetchInvitedUsers();
        this.invitedUsersLeft = [];
        await this.fetchInvitedUsersLeft();
        this.fetched = true;
    }

    calcInvites(){
        return this.regular + this.bonus - this.leaves - this.fake;
    }

    // Fetch and fill invited users
    async fetchInvitedUsers(){
        const { rows } = await this.handler.query(`
            SELECT * FROM member_invited_users
            WHERE user_id = '${this.id}'
            AND guild_id = '${this.guildID}';
        `);
        rows.forEach(invitedUserData => {
            this.invitedUsers.push(invitedUserData.invited_user_id);
        });
        return;
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
        return;
    }

    // Fetch and fill invited users left
    async fetchInvitedUsersLeft(){
        const { rows } = await this.handler.query(`
            SELECT * FROM member_invited_users_left
            WHERE user_id = '${this.id}'
            AND guild_id = '${this.guildID}';
        `);
        rows.forEach(invitedUserLeftData =>  {
            this.invitedUsersLeft.push(invitedUserLeftData.invited_user_id);
        });
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
        return;
    }

    // Fetch member join data
    async fetchJoinData(){
        const { rows } = await this.handler.query(`
            SELECT * FROM member_join_data
            WHERE user_id = '${this.id}'
            AND guild_id = '${this.guildID}';
        `);
        if(!rows[0]) return;
        this.handler.removeMemberFromOtherCaches(this.id, this.guildID);
        this.joinData = {
            type: rows[0].join_type,
            inviterID: rows[0].join_inviter_id,
            inviteData: rows[0].join_invite_data
        };
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
        return;
    }

    // Insert the member in the db if it doesn't exist
    async insert() {
        if (!this.inserted) {
            await this.handler.query(`
                INSERT INTO members
                (
                    user_id,
                    guild_id,
                    invites_fake,
                    invites_leaves,
                    invites_bonus,
                    invites_regular,
                    old_invites_fake,
                    old_invites_leaves,
                    old_invites_bonus,
                    old_invites_regular,
                    old_invites_backuped
                ) VALUES
                (
                    '${this.id}',
                    '${this.guildID}',
                    ${this.fake},
                    ${this.leaves},
                    ${this.bonus},
                    ${this.regular},
                    ${this.oldFake},
                    ${this.oldLeaves},
                    ${this.oldBonus},
                    ${this.oldRegular},
                    ${this.oldBackuped}
                );
            `);
            this.handler.removeMemberFromOtherCaches(this.id, this.guildID);
            this.inserted = true;
        }
        return this;
    }
};