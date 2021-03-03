const RedisHandler = require('./redis');
const PostgresHandler = require('./postgres');

module.exports = class DatabaseHandler {

    constructor () {
        
        this.redis = new RedisHandler();
        this.postgres = new PostgresHandler();

    }

    connect () {
        return Promise.all([
            this.redis.connect,
            this.postgres.connect
        ]);
    }
    
    /**
     * Fetches the guild settings
     * @path /guilds/3983080339/settings
     */
    async fetchGuildSettings (guildID) {
        const redisData = await this.redis.client.get(`guild_${guildID}`);
        if (redisData) return redisData;

        let { rows } = await this.postgres.client.query(`
            SELECT *
            FROM guilds
            WHERE guild_id = $1;
        `, guildID);
        
        if (!rows[0]) {
            ({ rows } = await this.postgres.client.query(`
                INSERT INTO guilds
                (guild_id, guild_language, prefix, keep_ranks, stacked_ranks, cmd_channel, fake_threshold) VALUES
                ($1, 'en-US', '+', false, false, null, null);
            `, guildID));
        }

        return rows;
    }

    /**
     * Changes the setting in a guild
     * @param {string} guildID 
     * @param {any} newValue
     * @param {string} setting 
     * @returns {Promise<void>}
     */
    setGuildSetting (guildID, newValue, setting) {
        if (!['language', 'prefix', 'cmd_channel', 'fake_treshold', 'keep_ranks', 'stacked_ranks']) return new Error('unknown_guild_setting');
        return Promise.all([
            this.redis.client.set(`guild_${guildID}`, `.${setting}`, newValue),
            this.postgres.client.query(`
                UPDATE guilds
                SET guild_${setting} = $1;
            `, newValue)
        ]);
    }

    /**
     * Add a new guild rank
     * @param {string} guildID
     * @param {roleID} roleID
     * @param {number} inviteCount
     */
    async addRank (guildID, roleID, inviteCount) {
        return Promise.all([
            this.postgres.query(`
                INSERT INTO guild_ranks
                (guild_id, role_id, invite_count) VALUES
                ($1, $2, $3)
            `, guildID, roleID, inviteCount),
            this.redis.push(`guild_ranks_${guildID}`, '.', {
                guildID,
                roleID,
                inviteCount
            })
        ]);
    }

    /**
     * Fetches the guild ranks
     * @path /guilds/398389083093/ranks
     */
    async fetchGuildRanks (guildID) {
        const redisData = await this.redis.client.get(`guild_ranks_${guildID}`);
        if (redisData) return redisData;

        const { rows } = await this.postgres.client.query(`
            SELECT *
            FROM guild_ranks
            WHERE guild_id = $1;
        `, guildID);
        const formattedRanks = rows.map((row) => ({
            guildID: row.guild_id,
            roleID: row.role_id,
            inviteCount: row.invite_count
        }));
        this.redis.client.set(`guild_ranks_${guildID}`, '.', formattedRanks);
        return formattedRanks;
    }

    /**
     * Fetches the guild plugins
     * @path /guilds/93803803/plugins
     */
    async fetchGuildPlugins (guildID) {
        const redisData = await this.redis.client.get(`guild_plugins_${guildID}`);
        if (redisData) return redisData;

        const postgresData = await this.postgres.client.query(`
            SELECT *
            FROM guild_plugins
            WHERE guild_id = $1;
        `, guildID);
        const formattedPlugins = rows.map((row) => ({
            guildID: row.guild_id,
            pluginName: row.plugin_name,
            pluginData: row.plugin_data
        }));
        this.redis.client.set(`guild_plugins_${guildID}`, '.', formattedPlugins);
        return formattedPlugins;
    }

    /**
     * Fetches the guild blacklisted users
     * @path /guilds/3803983/blacklisted
     */
    fetchGuildBlacklistedUsers () {

    }

    /**
     * Fetches a guild member
     * @path /guilds/309383/members/29830983/
     */
    async fetchGuildMember ({ memberID, guildID }) {
        const redisData = await this.redis.client.get(`member_${memberID}`);
        if (redisData) return redisData;

        let { rows } = await this.postgres.client.query(`
            SELECT *
            FROM members
            WHERE guild_id = $1
            AND user_id = $2;
        `, guildID, userID);

        if (!rows[0]) {
            ({ rows} = await this.postgres.client.query(`
                INSERT INTO members
                (
                    guild_id, user_id,
                    invites_fake, invites_leaves, invites_bonus, invites_regular,
                    old_invites_fake, old_invites_leaves, old_invites_bonus, old_invites_regular,
                    old_invites_backuped
                ) VALUES
                (
                    $1, $2,
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                    false
                );
            `, guildID, userID));
        }
        const formattedMember = rows.map((row) => ({
            userID: row.user_id,
            guildID: row.guild_id,
            fake: row.invites_fake,
            leaves: row.invites_leaves,
            bonus: row.invites_bonus,
            regular: row.invites_regular,
            oldFake: row.old_invites_fake,
            oldLeaves: row.old_invites_leaves,
            oldBonus: row.old_invites_bonus,
            oldRegular: row.old_invites_regular,
            oldBackuped: row.old_invites_backuped
        }));
        return formattedMember;
    }

    /**
     * Fetches the guild leaderboard
     * @path /guilds/30983803/leaderboard
     * 
     * @nocache
     */
    fetchGuildLeaderboard () {

    }

    /**
     * Fetches the member events (the members they invited)
     * @path /guilds/3983093/members/39838093/events/invitedby
     */
    fetchGuildMembersEventsInvitedBy () {

    }

    /**
     * Fetches the member events (when they have been invited)
     * @path /guilds/3338339383/members/3873793/events/invited
     */
    fetchGuildMembersEventsInvited () {

    }

    /**
     * Add a rank to a guild
     */
    addGuildRank ({ roleID, inviteCount }) {

    }

    fetchPremiumUserIDs () {
        return this.postgres.fetchPremiumUserIDs();
    }

    fetchPremiumGuildIDs () {
        return this.postgres.fetchPremiumGuildIDs();
    }

}
