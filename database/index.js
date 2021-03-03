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
     * Fetches the guild subscriptions
     */
    async fetchGuildSubscriptions (guildID) {
        const redisData = await this.redis.get(`guild_subscriptions_${guildID}`);
        if (redisData) return redisData;

        const { rows } = await this.postgres.query(`
            SELECT *
            FROM subscriptions
            INNER JOIN guilds_subscriptions ON guilds_subscriptions.sub_id = subscriptions.id
            WHERE guilds_subscriptions.guild_id = $1;
        `, guildID);

        const formattedGuildSubscriptions = rows.map((row) => ({
            id: row.id,
            expiresAt: row.expires_at,
            createdAt: row.created_at,
            subLabel: row.sub_label,
            guildsCount: row.guilds_count,
            patreonUserID: row.patreon_user_id,
            cancelled: row.cancelled,
            subInvalidated: row.sub_invalidated
        }));
        
        this.redis.set(`guild_subscriptions_${guildID}`, '.', formattedGuildSubscriptions);

        return formattedGuildSubscriptions;
    }
    
    /**
     * Fetches the guild settings
     * @path /guilds/3983080339/settings
     */
    async fetchGuildSettings (guildID) {
        const redisData = await this.redis.get(`guild_${guildID}`);
        if (redisData) return redisData;

        let { rows } = await this.postgres.query(`
            SELECT *
            FROM guilds
            WHERE guild_id = $1;
        `, guildID);
        
        if (!rows[0]) {
            ({ rows } = await this.postgres.query(`
                INSERT INTO guilds
                (guild_id, guild_language, guild_prefix, guild_keep_ranks, guild_stacked_ranks, guild_cmd_channel, guild_fake_threshold) VALUES
                ($1, 'en-US', '+', false, false, null, null);
            `, guildID));
        }

        const formattedGuildSettings = {
            guildID: rows[0].guild_id,
            language: rows[0].guild_language,
            prefix: rows[0].guild_prefix,
            keepRanks: rows[0].guild_keep_ranks,
            stackedRanks: rows[0].guild_stacked_ranks,
            cmdChannel: rows[0].guild_cmd_channel,
            fakeThreshold: rows[0].guild_fake_threshold            
        };

        this.redis.set(`guild_${guildID}`, '.', formattedGuildSettings);

        return formattedGuildSettings;
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
            this.redis.set(`guild_${guildID}`, `.${setting}`, newValue),
            this.postgres.query(`
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
        const redisData = await this.redis.get(`guild_ranks_${guildID}`);
        if (redisData) return redisData;

        const { rows } = await this.postgres.query(`
            SELECT *
            FROM guild_ranks
            WHERE guild_id = $1;
        `, guildID);
        const formattedRanks = rows.map((row) => ({
            guildID: row.guild_id,
            roleID: row.role_id,
            inviteCount: row.invite_count
        }));
        this.redis.set(`guild_ranks_${guildID}`, '.', formattedRanks);
        return formattedRanks;
    }

    /**
     * Fetches the guild plugins
     * @path /guilds/93803803/plugins
     */
    async fetchGuildPlugins (guildID) {
        const redisData = await this.redis.get(`guild_plugins_${guildID}`);
        if (redisData) return redisData;

        const postgresData = await this.postgres.query(`
            SELECT *
            FROM guild_plugins
            WHERE guild_id = $1;
        `, guildID);
        const formattedPlugins = rows.map((row) => ({
            guildID: row.guild_id,
            pluginName: row.plugin_name,
            pluginData: row.plugin_data
        }));
        this.redis.set(`guild_plugins_${guildID}`, '.', formattedPlugins);
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
        const redisData = await this.redis.get(`member_${memberID}`);
        if (redisData) return redisData;

        let { rows } = await this.postgres.query(`
            SELECT *
            FROM members
            WHERE guild_id = $1
            AND user_id = $2;
        `, guildID, userID);

        if (!rows[0]) {
            ({ rows} = await this.postgres.query(`
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

    fetchPremiumUserIDs () {
        return this.postgres.fetchPremiumUserIDs();
    }

    async fetchPremiumGuildIDs () {
        const { rows } = await this.postgres.query(`
            SELECT guild_id
            FROM guilds_subscriptions
        `);
        return rows.map((row) => row.guild_id);
    }

}
