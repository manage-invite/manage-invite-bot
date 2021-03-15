const RedisHandler = require('./redis');
const PostgresHandler = require('./postgres');

const snakeCase = require('snake-case');

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

    formatEvent (eventRow) {
        return {
            userID: eventRow.user_id,
            guildID: eventRow.guild_id,
            eventType: eventRow.event_type,
            eventDate: new Date(eventRow.event_date).getTime(),
            joinType: eventRow.join_type,
            inviterID: eventRow.inviter_user_id,
            inviteData: eventRow.invite_data,
            storageID: eventRow.storage_id
        };
    } 

    /**
     * Count the guild invites present in the latest storage
     */
    async countGuildInvites (guildID, currentStorageID) {
        const guildStorages = await this.fetchGuildStorages(guildID);
        const previousStorageID = guildStorages
            .filter((storage) => storage.storageID !== currentStorageID)
            .sort((a, b) => b.createdAt - a.createdAt)[0]?.storageID;
        if (!previousStorageID) return null;
        const { rows } = await this.postgres.query(`
            SELECT
                guild_id,
                SUM(invites_regular) as invites_regular,
                SUM(invites_fake) as invites_fake,
                SUM(invites_bonus) as invites_bonus,
                SUM(invites_leaves) as invites_leaves
            FROM members
            WHERE guild_id = $1
            AND storage_id = $2
            GROUP BY 1;
        `, guildID, previousStorageID);
        return {
            regular: rows[0]?.invites_regular || 0,
            leaves: rows[0]?.invites_leaves || 0,
            bonus: rows[0]?.invites_bonus || 0,
            fake: rows[0]?.invites_fake || 0
        };
    }

    /**
     * Remove the guild invites by creating a new storage and set it to default
     */
    async removeGuildInvites (guildID) {
        const { rows } = await this.postgres.query(`
            UPDATE guilds
            SET guild_storage_id = $1
            WHERE guild_id = $2
            RETURNING guild_storage_id;
        `, this.generateStorageID(), guildID);
        const newStorageID = rows[0].guild_storage_id;

        const redisData = await this.redis.getHash(`guild_${guildID}`);
        if (redisData && redisData.guildID) {
            await this.redis.setHash(`guild_${guildID}`, {
                storageID: newStorageID
            });
        }

        await this.postgres.query(`
            INSERT INTO guild_storages
            (guild_id, storage_id, created_at) VALUES
            ($1, $2, $3);
        `, guildID, newStorageID, new Date().toISOString());
    }

    /**
     * Fetches the guild storages
     */
    async fetchGuildStorages (guildID) {
        const { rows } = await this.postgres.query(`
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

        const redisData = await this.redis.getHash(`guild_${guildID}`);
        if (redisData && redisData.guildID) {
            await this.redis.setHash(`guild_${guildID}`, {
                storageID: newStorageID
            });
        }
    }

    /**
     * Restore the guild invites by changing back the storage id
     */
    async restoreGuildInvites (guildID, currentStorageID) {
        const guildStorages = await this.fetchGuildStorages(guildID);
        const latestStorageID = guildStorages
            .filter((storage) => storage.storageID !== currentStorageID)
            .sort((a, b) => b.createdAt - a.createdAt)[0]?.storageID;
        await this.restoreGuildStorage({
            guildID,
            storageID: latestStorageID
        });
    }

    /**
     * Fetches the guild subscriptions
     */
    async fetchGuildSubscriptions (guildID) {
        const redisData = await this.redis.getString(`guild_subscriptions_${guildID}`, { json: true });
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
        
        this.redis.setString(`guild_subscriptions_${guildID}`, JSON.stringify(formattedGuildSubscriptions));

        return formattedGuildSubscriptions;
    }

    async createSubscriptionPayment (subID, { payerDiscordID, payerDiscordUsername, payerEmail, amount, createdAt = new Date(), type, transactionID, details = {}, signupID, modDiscordID }) {
        const { rows } = await this.postgres.query(`
            INSERT INTO payments
            (payer_discord_id, payer_discord_username, payer_email, amount, created_at, type, transaction_id, details, signup_id, mod_discord_id) VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id;
        `, payerDiscordID, payerDiscordUsername, payerEmail, amount, createdAt.toISOString(), type, transactionID, JSON.stringify(details), signupID, modDiscordID);
        const paymentID = rows[0].id;
        await this.postgres.query(`
            INSERT INTO subscriptions_payments
            (sub_id, payment_id) VALUES
            ($1, $2);
        `, subID, paymentID);
    }

    async createGuildSubscription (guildID, { expiresAt = new Date(), createdAt = new Date(), subLabel, guildsCount = 1, patreonUserID }) {
        const { rows } = await this.postgres.query(`
            INSERT INTO subscriptions
            (expires_at, created_at, sub_label, guilds_count, patreon_user_id) VALUES
            ($1, $2, $3, $4, $5)
            RETURNING id;
        `, expiresAt.toISOString(), createdAt.toISOString(), subLabel, guildsCount, patreonUserID);
        const subID = rows[0].id;
        await this.postgres.query(`
            INSERT INTO guilds_subscriptions
            (sub_id, guild_id) VALUES
            ($1, $2);
        `, subID, guildID);
        const guildsSubscriptions = await this.redis.getString(`guild_subscriptions_${guildID}`)
    }

    async updateGuildSubscription (subID, guildID, newSettingData) {
        const setting = Object.keys(newSettingData)[0];
        if (!['expires_at', 'created_at', 'sub_label', 'guilds_count', 'patreon_user_id', 'cancelled', 'sub_invalidated'].includes(snakeCase(setting))) return new Error('unknown_guild_setting');
        const guildSubscriptions = await this.redis.getString(`guild_subscriptions_${guildID}`, { json: true });
        if (guildSubscriptions) {
            const guildSubscription = guildSubscriptions.find((sub) => sub.id === subID);
            guildSubscription[setting] = newSettingData[setting];
            const newGuildSubscriptions = [
                ...guildSubscriptions.filter((sub) => sub.id !== subID),
                guildSubscription
            ];
            this.redis.setString(`guild_subscriptions_${guildID}`, JSON.stringify(newGuildSubscriptions));
        }
        await this.postgres.query(`
            UPDATE guilds
            SET guild_${snakeCase(setting)} = $1;
        `, newSettingData[setting])
    }
    
    /**
     * Fetches the guild settings
     * @path /guilds/3983080339/settings
     */
    async fetchGuildSettings (guildID) {
        const redisData = await this.redis.getHash(`guild_${guildID}`);
        if (redisData && redisData.guildID) return redisData;

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
            `, guildID, rows[0].guild_storage_id, new Date().toISOString());
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

        this.redis.setHash(`guild_${guildID}`, formattedGuildSettings);

        return formattedGuildSettings;
    }

    /**
     * Changes the setting in a guild
     * @param {string} guildID 
     * @param {any} newSettingData
     * @returns {Promise<void>}
     */
    setGuildSetting (guildID, newSettingData) {
        const setting = Object.keys(newSettingData)[0];
        if (!['language', 'prefix', 'cmd_channel', 'fake_treshold', 'keep_ranks', 'stacked_ranks', 'storage_id'].includes(snakeCase(setting))) return new Error('unknown_guild_setting');
        return Promise.all([
            this.redis.setHash(`guild_${guildID}`, newSettingData).catch(() => {}), // here we have to catch because it will throw an error if the object is not stored in redis
            this.postgres.query(`
                UPDATE guilds
                SET guild_${snakeCase(setting)} = $1;
            `, newSettingData[setting])
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
            this.redis.pushJSON(`guild_ranks_${guildID}`, '.', {
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
        const redisData = await this.redis.getJSON(`guild_ranks_${guildID}`);
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
        this.redis.setJSON(`guild_ranks_${guildID}`, '.', formattedRanks);
        return formattedRanks;
    }

    /**
     * Fetches the guild plugins
     * @path /guilds/93803803/plugins
     */
    async fetchGuildPlugins (guildID) {
        const redisData = await this.redis.getJSON(`guild_plugins_${guildID}`);
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
        this.redis.setJSON(`guild_plugins_${guildID}`, '.', formattedPlugins);
        return formattedPlugins;
    }

    /**
     * Add X invites to a member / the server
     */
    addInvites ({ userID, guildID, storageID, number, type }) {
        return Promise.all([
            this.redis.incrHashBy(`member_${userID}_${guildID}_${storageID}`, type, number), // here we have to catch because it will throw an error if the object is not stored in redis
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
        const redisUpdates = usersIDs.map((userID) => this.redis.incrHashBy(`member_${userID}_${guildID}_${storageID}`, type, number).catch(() => {}));
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
        const redisData = await this.redis.getJSON(`guild_blacklisted_${guildID}`);
        if (redisData) return redisData;

        const { rows } = await this.postgres.query(`
            SELECT *
            FROM guild_blacklisted_users
            WHERE guild_id = $1;
        `, guildID);

        const formattedBlacklistedUsers = rows.map((row) => row.user_id);

        this.redis.setJSON(`guild_blacklisted_${guildID}`, '.', formattedBlacklistedUsers);
        return formattedBlacklistedUsers;
    }

    /**
     * Fetches the guild leaderboard
     */
    async fetchGuildLeaderboard (guildID, storageID) {
        const redisData = await this.redis.getString(`guild_leaderboard_${guildID}`);
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

        this.redis.setString(`guild_leaderboard_${guildID}`, formattedMembers);
        this.redis.client.redis.expire(`guild_leaderboard_${guildID}`, 60);

        return formattedMembers;
    }

    /**
     * Fetches a guild member
     * @path /guilds/309383/members/29830983/
     */
    async fetchGuildMember ({ userID, guildID, storageID }) {
        console.log(storageID)
        const redisData = await this.redis.getHash(`member_${userID}_${guildID}_${storageID}`);
        if (redisData && redisData.userID) return redisData;

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
        this.redis.setHash(`member_${userID}_${guildID}_${storageID}`, formattedMember)
        return formattedMember;
    }

    /**
     * Fetches the member events (the members they invited)
     * @path /guilds/3983093/members/39838093/events/invitedby
     */
    async fetchGuildMemberEvents ({ userID, guildID }) {
        const redisData = await this.redis.getJSON(`member_${userID}_${guildID}_events`);
        if (redisData) return redisData;

        const { rows } = await this.postgres.query(`
            SELECT *
            FROM invited_members_events
            WHERE user_id = $1
            OR inviter_user_id = $1
            AND guild_id = $2;
        `, userID, guildID);

        const formattedEvents = rows.map((row) => this.formatEvent(row));
        this.redis.setJSON(`member_${userID}_${guildID}_events`, '.', formattedEvents);

        return formattedEvents;
    }

    async fetchSubscriptionPayments (subID) {
        const { rows } = await this.postgres.query(`
            SELECT *
            FROM payments p
            INNER JOIN subscriptions_payments sp ON sp.payment_id = p.id
            WHERE sp.sub_id = $1;
        `, subID);
        
        return rows.map((row) => ({
            id: row.id,
            payerDiscordID: row.payer_discord_id,
            amount: row.amount,
            createdAt: row.created_at,
            type: row.type,
            transactionID: row.transaction_id,
            details: row.details,
            modDiscordID: row.mod_discord_id,
            signupID: row.signup_id,
            payerEmail: row.payer_email,
            payerDiscordUsername: row.payer_discord_username
        }));
    }

    async createGuildMemberEvent ({ userID, guildID, eventDate = new Date(), eventType, joinType, inviterID, inviteData, joinFake, storageID }) {
        this.redis.getJSON(`member_${userID}_${guildID}_events`).then((data) => {
            if (data) this.redis.pushJSON(`member_${userID}_${guildID}`, '.', { userID, guildID, eventDate, eventType, joinType, inviterID, inviteData, joinFake, storageID });
        });
        if (inviterID) {
            this.redis.getJSON(`member_${inviterID}_${guildID}_events`).then((data) => {
                if (data) this.redis.pushJSON(`member_${inviterID}_${guildID}`, '.', { userID, guildID, eventDate, eventType, joinType, inviterID, inviteData, joinFake, storageID });
            });
        }

        await this.postgres.query(`
            INSERT INTO invited_member_events
            (user_id, guild_id, event_date, event_type, join_type, inviter_user_id, invite_data, join_fake, storage_id) VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `, userID, guildID, eventDate.toISOString(), eventType, joinType, inviterID, inviteData, joinFake, storageID);
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
