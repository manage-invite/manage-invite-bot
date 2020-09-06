const { stringOrNull, pgEscape } = require("../helpers/functions");

const JoinPlugin = require("./JoinPlugin");
const JoinDMPlugin = require("./JoinDMPlugin");
const LeavePlugin = require("./LeavePlugin");
const Subscription = require("./Subscription");

module.exports = class Guild {
    constructor (handler, { id, data, plugins, ranks, blacklistedUsers, subscriptions }) {

        this.id = id;

        this.handler = handler;
        this.handler.guildCache.set(this.id, this);

        // Data received from database
        this.rawData = {
            plugins,
            ranks,
            blacklistedUsers,
            subscriptions
        };

        // Guild language
        this.language = data.guild_language || this.handler.client.config.enabledLanguages.find((language) => language.default).name;
        // Guild prefix
        this.prefix = data.guild_prefix || "+";
        // Guild keep ranks
        this.keepRanks = data.guild_keep_ranks || false;
        // Guild stacked ranks
        this.stackedRanks = data.guild_stacked_ranks || false;
        // Guild cmd channel
        this.cmdChannel = data.guild_cmd_channel || null;

        // Subscriptions
        this.subscriptions = [];
        subscriptions.forEach(({ sub_id, sub_data }) => {
            const subscription = this.handler.subscriptionCache.find((sub) => sub.id === sub_id) || new Subscription(this.handler, {
                id: sub_id,
                data: sub_data
            });
            this.subscriptions.push(subscription);
        });

        // Plugins
        const getPluginData = (name) => plugins.find(p => p.plugin_name === name) ? this.rawData.plugins.find(p => p.plugin_name === name).plugin_data : null;
        this.join = new JoinPlugin(this, getPluginData("join"));
        this.joinDM = new JoinDMPlugin(this, getPluginData("joinDM"));
        this.leave = new LeavePlugin(this, getPluginData("leave"));

        // Ranks
        this.ranks = [];
        ranks.forEach(rankData => {
            this.ranks.push({
                roleID: rankData.role_id,
                inviteCount: rankData.invite_count
            });
        });

        // Blacklisted users
        this.blacklistedUsers = blacklistedUsers.map(blacklistData => blacklistData.user_id);
    }

    get premium (){
        return this.subscriptions.some((subscription) => subscription.active);
    }
    
    get aboutToExpire (){
        return this.premium && this.subscriptions.every((subscription) => subscription.aboutToExpire);
    }

    get trialPeriodEnabled (){
        return this.premium && this.subscriptions.every((subscription) => subscription.isTrial);
    }

    get trialPeriodUsed (){
        return this.subscriptions.length > 0;
    }

    get premiumExpiresAt (){
        return this.subscriptions.sort((a, b) => b.expiresAt - a.expiresAt)[0].expiresAtCalculated;
    }

    // Change the guild cmd channel
    async setCmdChannel (newValue){
        this.cmdChannel = newValue;
        await this.handler.query(`
            UPDATE guilds
            SET guild_cmd_channel = ${stringOrNull(newValue)}
            WHERE guild_id = '${this.id}';
        `);
        this.handler.removeGuildFromOtherCaches(this.id);
        return this.cmdChannel;
    }

    // Add a new rank
    async addRank (roleID, inviteCount){
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
    async removeRank (inviteCount){
        await this.handler.query(`
            DELETE FROM guild_ranks
            WHERE guild_id = '${this.id}'
            AND invite_count = ${inviteCount};
        `);
        this.handler.removeGuildFromOtherCaches(this.id);
        this.ranks = this.ranks.filter((rank) => rank.inviteCount !== inviteCount);
        return this.ranks;
    }

    // Add a user to the blacklist
    async addUserBlacklist (userID){
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
    async removeUserBlacklist (userID){
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
    async setKeepRanks (boolean){
        await this.handler.query(`
            UPDATE guilds
            SET guild_keep_ranks = ${boolean}
            WHERE guild_id = '${this.id}';
        `);
        this.handler.removeGuildFromOtherCaches(this.id);
        this.keepRanks = boolean;
        return this;
    }

    // Update stacked ranks
    async setStackedRanks (boolean){
        await this.handler.query(`
            UPDATE guilds
            SET guild_stacked_ranks = ${boolean}
            WHERE guild_id = '${this.id}';
        `);
        this.handler.removeGuildFromOtherCaches(this.id);
        this.stackedRanks = boolean;
        return this;
    }

    // Update the guild language
    async setLanguage (newLanguage) {
        await this.handler.query(`
            UPDATE guilds
            SET guild_language = '${pgEscape(newLanguage)}'
            WHERE guild_id = '${this.id}';
        `);
        this.handler.removeGuildFromOtherCaches(this.id);
        this.language = newLanguage;
        return this;
    }

    // Update the guild prefix
    async setPrefix (newPrefix) {
        await this.handler.query(`
            UPDATE guilds
            SET guild_prefix = '${pgEscape(newPrefix)}'
            WHERE guild_id = '${this.id}';
        `);
        this.handler.removeGuildFromOtherCaches(this.id);
        this.prefix = newPrefix;
        return this;
    }

};