const RedisHandler = require('./redis');
const PostgresHandler = require('./postgres');

const camelCase = require('camelcase');

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

    generateStorageID () {
        return [...Array(12)].map(i=>(~~(Math.random()*36)).toString(36)).join('');
    }

    calculateInvites (memberRow) {
        return memberRow.invites_leaves - memberRow.invites_fake + memberRow.invites_regular + memberRow.invites_bonus;
    }

    /**
     * Count the guild invites present in the latest storage
     */
    async countGuildInvites (guildID, currentStorageID) {
        const guildStorages = await this.fetchGuildStorages(guildID);
        const latestStorageID = guildStorages
            .filter((storage) => storage.storageID !== currentStorageID)
            .sort((a, b) => b.createdAt - a.createdAt);
        const { rows } = await this.postgres.query(`
            SELECT
                guild_id,
                SUM(invites_regular) as regular,
                SUM(invites_fake) as fake,
                SUM(invites_bonus) as bonus,
                SUM(invites_leaves) as leaves
            FROM members
            WHERE guild_id = $1
            AND storage_id = $2
            GROUP BY 1;
        `, guildID, latestStorageID);
        return {
            regular: rows[0].invites_regular,
            leaves: rows[0].invites_leaves,
            bonus: rows[0].invites_bonus,
            fake: rows[0].invites_fake
        };
    }

    /**
     * Remove the guild invites by creating a new storage and set it to default
     */
    async removeGuildInvites (guildID) {
        const { rows } = await this.postgres.query(`
            UPDATE guilds
            SET guild_storage_id = $1
            WHERE guild_id = 2
            RETURNING guild_storage_id;
        `, this.generateStorageID(), guildID);
        const newStorageID = rows[0].storage_id;

        const redisData = await this.redis.get(`guild_${guildID}`);
        if (redisData) {
            await this.redis.set(`guild_${guildID}`, '.storageID', newStorageID);
        }

        await this.postgres.query(`
            INSERT INTO guild_storages
            (guild_id, storage_id, created_at) VALUES
            ($1, $2, $3);
        `, guildID, newStorageID, new Date().toLocaleString());
    }

    /**
     * Fetches the guild storages
     */
    async fetchGuildStorages (guildID) {
        const { rows } = this.postgres.query(`
            SELECT *
            FROM guild_storages
            WHERE guild_id = $1;
        `, guildID);
        return rows.map((row) => ({
            guildID: row.guild_id,
            storageID: row.storage_id,
            createdAt: new Date(row.created_at).getTime()
        }));
    }

    /**
     * Restore the guild storage by changing back the storage id
     */
    async restoreGuildStorage ({ guildID, storageID }) {
        const { rows } = await this.postgres.query(`
            UPDATE guilds
            SET guild_storage_id = $1
            WHERE guild_id = $2
            RETURNING guild_storage_id;
        `, storageID, guildID);
        const newStorageID = rows[0].guild_storage_id;

        const redisData = await this.redis.get(`guild_${guildID}`);
        if (redisData) {
            await this.redis.set(`guild_${guildID}`, '.storageID', newStorageID);
        }
    }

    /**
     * Restore the guild invites by changing back the storage id
     */
    async restoreGuildInvites (guildID, currentStorageID) {
        const guildStorages = await this.fetchGuildStorages(guildID);
        const latestStorageID = guildStorages
            .filter((storage) => storage.storageID !== currentStorageID)
            .sort((a, b) => b.createdAt - a.createdAt);
        await this.restoreGuildStorage({
            guildID,
            storageID: latestStorageID
        });
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
                (guild_id, guild_language, guild_prefix, guild_keep_ranks, guild_stacked_ranks, guild_cmd_channel, guild_fake_threshold, guild_storage_id) VALUES
                ($1, 'en-US', '+', false, false, null, null, $2)
                RETURNING guild_storage_id;
            `, guildID, this.generateStorageID()));
            await this.postgres.query(`
                INSERT INTO guild_storages
                (guild_id, storage_id, created_at) VALUES
                ($1, $2, $3);
            `, guildID, rows[0].guild_storage_id, new Date().toLocaleString());
        }

        const formattedGuildSettings = {
            guildID: rows[0].guild_id,
            storageID: rows[0].guild_storage_id,
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
        if (!['language', 'prefix', 'cmd_channel', 'fake_treshold', 'keep_ranks', 'stacked_ranks', 'storage_id']) return new Error('unknown_guild_setting');
        return Promise.all([
            this.redis.set(`guild_${guildID}`, `.${camelCase(setting)}`, newValue).catch(() => {}), // here we have to catch because it will throw an error if the object is not stored in redis
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

        const { rows } = await this.postgres.query(`
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
     * Add X invites to a member / the server
     */
    addInvites ({ userID, guildID, storageID, number, type }) {
        return Promise.all([
            this.redis.numincrby(`member_${userID}_${guildID}_${storageID}`, `.${type}`, number).catch(() => {}), // here we have to catch because it will throw an error if the object is not stored in redis
            this.postgres.query(`
                UPDATE members
                SET invites_${type} = $1
                WHERE user_id = $2
                AND guild_id = $3
                AND storage_id = $4;
            `, number, userID, guildID, storageID)
        ]);
    }

    /**
     * Add invites to a server
     */
    async addGuildInvites ({ userIDs, guildID, storageID, number, type }) {
        const redisUpdates = usersIDs.map((userID) => this.redis.numincrby(`member_${userID}_${guildID}_${storageID}`, `.${type}`, number).catch(() => {}));
        return Promise.all([
            Promise.all(redisUpdates),
            this.postgres.query(`
                UPDATE members
                SET invites_${type} = invites_${type} + $1
                WHERE guild_id = $2
                AND storage_id = $3;
            `, number, guildID, storageID)
        ]);
    }

    /**
     * Fetches the guild blacklisted users
     * @path /guilds/3803983/blacklisted
     */
    async fetchGuildBlacklistedUsers (guildID) {
        const redisData = await this.redis.get(`guild_blacklisted_${guildID}`);
        if (redisData) return redisData;

        const { rows } = await this.postgres.query(`
            SELECT *
            FROM guild_blacklisted_users
            WHERE guild_id = $1;
        `, guildID);

        const formattedBlacklistedUsers = rows.map((row) => row.user_id);

        this.redis.set(`guild_blacklisted_${guildID}`, '.', formattedBlacklistedUsers);
        return formattedBlacklistedUsers;
    }

    /**
     * Fetches the guild leaderboard
     */
    async fetchGuildLeaderboard (guildID, storageID) {
        const redisData = await this.redis.get(`guild_leaderboard_${guildID}`);
        if (redisData) return redisData;

        const { rows } = await this.postgres.query(`
            SELECT user_id, invites_regular, invites_leaves, invites_bonus, invites_fake
            FROM members
            WHERE guild_id = $1
            AND storage_id = $2;
        `, guildID, storageID);

        const formattedMembers = rows.map((row) => ({
            userID: row.user_id,
            invites: this.calculateInvites(row),
            regular: row.invites_regular,
            leaves: row.invites_leaves,
            bonus: row.invites_bonus,
            fake: row.invites_fake
        }));

        this.redis.set(`guild_leaderboard_${guildID}`, '.', formattedMembers);
        this.redis.client.redis.expire(`guild_leaderboard_${guildID}`, 60);

        return formattedMembers;
    }

    /**
     * Fetches a guild member
     * @path /guilds/309383/members/29830983/
     */
    async fetchGuildMember ({ userID, guildID, storageID }) {
        const redisData = await this.redis.get(`member_${userID}_${guildID}_${storageID}`);
        if (redisData) return redisData;

        let { rows } = await this.postgres.query(`
            SELECT *
            FROM members
            WHERE guild_id = $1
            AND user_id = $2
            AND storage_id = $3;
        `, guildID, userID, storageID);

        if (!rows[0]) {
            ({ rows } = await this.postgres.query(`
                INSERT INTO members
                (
                    guild_id, user_id, storage_id,
                    invites_fake, invites_leaves, invites_bonus, invites_regular
                ) VALUES
                (
                    $1, $2, $3,
                    0, 0, 0, 0
                )
                RETURNING *;
            `, guildID, userID, storageID));
        }
        const formattedMember = {
            userID: rows[0].user_id,
            guildID: rows[0].guild_id,
            storageID: rows[0].storage_id,
            invites: this.calculateInvites(rows[0]),
            fake: rows[0].invites_fake,
            leaves: rows[0].invites_leaves,
            bonus: rows[0].invites_bonus,
            regular: rows[0].invites_regular
        };
        this.redis.set(`member_${userID}_${guildID}_${storageID}`, '.', formattedMember)
        return formattedMember;
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
