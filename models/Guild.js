const { Collection } = require("discord.js");

const JoinPlugin = require("./JoinPlugin");
const JoinDMPlugin = require("./JoinDMPlugin");
const LeavePlugin = require("./LeavePlugin");

module.exports = class Guild {
    constructor(guildID, data, handler) {
        if(!data) data = {};
        this.id = guildID;
        this.handler = handler;
        this.inserted = Object.keys(data).length !== 0;
        this.data = data;
        // Whether the guild is fetched
        this.fetched = false;
        // Guild language
        this.language = data.guild_language || "english";
        // Guild prefix
        this.prefix = data.guild_prefix || "+";
        // Guild premium status
        this.premium = data.guild_is_premium || false;
        // Guild keep ranks
        this.keepRanks = data.guild_keep_ranks || false;
    }

    async fetch() {
        if (this.fetched) return;
        this.plugins = {};
        await this.fetchPlugins();
        this.ranks = [];
        await this.fetchRanks();
        this.blacklistedUsers = [];
        await this.fetchBlacklistedUsers();
        this.fetched = true;
    }

    // Fetch and fill plugins
    async fetchPlugins() {
        const { rows } = await this.handler.query(`
            SELECT * FROM guild_plugins
            WHERE guild_id = '${this.id}';
        `);
        const getPluginData = (name) => rows.find(p => p.plugin_name === name) ? rows.find(p => p.plugin_name === name).plugin_data : null;
        this.join = new JoinPlugin(this, getPluginData("join"));
        this.join.insert();
        this.joinDM = new JoinDMPlugin(this, getPluginData("joinDM"));
        this.joinDM.insert();
        this.leave = new LeavePlugin(this, getPluginData("leave"));
        this.leave.insert();
        return this.plugins;
    }

    // Fetch and fill ranks
    async fetchRanks() {
        const { rows } = await this.handler.query(`
            SELECT * FROM guild_ranks
            WHERE guild_id = '${this.id}';
        `);
        rows.forEach(rankData => {
            this.ranks.push({
                roleID: rankData.role_id,
                inviteCount: rankData.invite_count
            });
        });
        return this.ranks;
    }

    // Add a new rank
    async addRank(roleID, inviteCount){
        await this.handler.query(`
            INSERT INTO guild_ranks
            (guild_id, role_id, invite_count) VALUES
            ('${this.id}', '${roleID}', ${inviteCount});
        `);
        this.handler.removeGuildFromOtherCaches(this.id);
        this.ranks.push({
            roleID,
            inviteCount
        });
        return this.ranks;
    }

    // Remove a rank
    async removeRank(inviteCount){
        await this.handler.query(`
            DELETE FROM guild_ranks
            WHERE guild_id = '${this.id}'
            AND invite_count = ${inviteCount};
        `);
        this.handler.removeGuildFromOtherCaches(this.id);
        this.ranks = this.ranks.filter((rank) => rank.inviteCount !== inviteCount);
        return this.ranks;
    }

    // Fetch and fill blacklisted users
    async fetchBlacklistedUsers(){
        const { rows } = await this.handler.query(`
            SELECT * FROM guild_blacklisted_users
            WHERE guild_id = '${this.id}';
        `);
        rows.forEach(blacklistData => {
            this.blacklistedUsers.push(blacklistData.user_id);
        });
        return this.blacklistedUsers;
    }

    // Add a user to the blacklist
    async addUserBlacklist(userID){
        await this.handler.query(`
            INSERT INTO guild_blacklisted_users
            (guild_id, user_id) VALUES
            ('${this.id}', '${userID}');
        `);
        this.handler.removeGuildFromOtherCaches(this.id);
        this.blacklistedUsers.push(userID);
        return this.blacklistedUsers;
    }

    // Remove a user from the blacklist
    async removeUserBlacklist(userID){
        await this.handler.query(`
            DELETE FROM guild_blacklisted_users
            WHERE guild_id = '${this.id}'
            AND user_id = '${userID}';
        `);
        this.handler.removeGuildFromOtherCaches(this.id);
        this.blacklistedUsers = this.blacklistedUsers.filter((id) => id !== userID);
        return this.blacklistedUsers;
    }

    // Update keep ranks
    async setKeepRanks(boolean){
        await this.handler.query(`
            UPDATE guilds
            SET guild_keep_ranks = ${boolean}
            WHERE guild_id = '${this.id}';
        `);
        this.handler.removeGuildFromOtherCaches(this.id);
        this.keepRanks = boolean;
        return this;
    }

    // Update the guild language
    async setLanguage(newLanguage) {
        await this.handler.query(`
            UPDATE guilds
            SET guild_language = '${newLanguage}'
            WHERE guild_id = '${this.id}';
        `);
        this.handler.removeGuildFromOtherCaches(this.id);
        this.language = newLanguage;
        return this;
    }

    // Update the guild prefix
    async setPrefix(newPrefix) {
        await this.handler.query(`
            UPDATE guilds
            SET guild_prefix = '${newPrefix}'
            WHERE guild_id = '${this.id}';
        `);
        this.handler.removeGuildFromOtherCaches(this.id);
        this.prefix = newPrefix;
        return this;
    }

    // Insert the guild in the db if it doesn't exist
    async insert() {
        if (!this.inserted) {
            await this.handler.query(`
                INSERT INTO guilds
                (guild_id, guild_prefix, guild_language, guild_is_premium, guild_keep_ranks) VALUES
                ('${this.id}', '${this.prefix}', '${this.language}', ${this.premium}, ${this.keepRanks});
            `);
            this.handler.removeGuildFromOtherCaches(this.id);
            this.inserted = true;
        }
        return this;
    }
};