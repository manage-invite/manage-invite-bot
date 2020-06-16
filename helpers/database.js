const { Pool } = require("pg");
const { Collection } = require("discord.js");
const { asyncForEach, stringOrNull, pgEscape } = require("./functions");
const logger = require("./logger");

const Guild = require("../models/Guild");
const Member = require("../models/Member");
const Subscription = require("../models/Subscription");

module.exports = class DatabaseHandler {
    constructor(client) {
        Object.defineProperty(this, "client", { value: client });
        const { database } = this.client.config;
        this.pool = new Pool(database);
        this.pool
        .on("connect", () => {
            logger.log("Shard #"+this.client.shard.ids[0]+" connected to database.");
        });

        // Cache
        this.guildCache = new Collection();
        this.memberCache = new Collection();
        this.subscriptionCache = new Collection();
    }

    async initCache() {
        await this.client.helpers.asyncForEach.execute(
            this.client.guilds.cache.array(),
            async guild => {
                await this.fetchGuild(guild.id);
            }
        );
    }

    async saveStats(guildsCreated, guildsDeleted, commandsRan, pgQueries, date = new Date()) {
        this.query(`
            INSERT INTO stats
            (date, guilds_created, guilds_deleted, commands_ran, pg_queries) VALUES
            ('${date.toISOString()}', ${guildsCreated}, ${guildsDeleted}, ${commandsRan}, ${pgQueries});
        `);
        return;
    }

    removeAllMembersFromOtherCaches(guildID){
        this.client.shard.broadcastEval(`
            this.database.removeAllMembersFromCache('${guildID}');
        `);
    }

    removeMemberFromOtherCaches(memberID, guildID){
        const shardID = this.client.shard.ids[0];
        this.client.shard.broadcastEval(`
            if(this.shard.ids[0] !== ${shardID}){
                this.database.removeMemberFromCache('${memberID}', '${guildID}');
            }
        `);
    }

    removeGuildFromOtherCaches(guildID){
        const shardID = this.client.shard.ids[0];
        this.client.shard.broadcastEval(`
            if(this.shard.ids[0] !== ${shardID}){
                this.database.removeGuildFromCache('${guildID}');
            }
        `);
    }

    removeAllMembersFromCache(guildID){
        this.memberCache = this.memberCache.filter((member) => member.guildID !== guildID);
    }

    syncSubscriptionForOtherCaches(subID){
        const shardID = this.client.shard.ids[0];
        this.client.shard.broadcastEval(`
            if(this.shard.ids[0] !== ${shardID}){
                this.database.removeSubscriptionFromCache('${subID}');
                this.database.fetchSubscription('${subID}');
            }
        `);
    }

    removeSubscriptionFromCache(subID){
        if(this.subscriptionCache.has(subID)){
            this.subscriptionCache.get(subID).guilds.forEach((guild) => this.removeGuildFromCache(guild.id));
            this.subscriptionCache.delete(subID);
        }
    }

    removeGuildFromCache(guildID){
        this.guildCache.delete(guildID);
    }

    removeMemberFromCache(memberID, guildID){
        this.memberCache.delete(`${memberID}${guildID}`);
    }

    // Make a new query to the db
    query(string) {
        this.client.pgQueries++;
        return new Promise((resolve, reject) => {
            this.pool.query(string, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }

    fetchPremiumGuilds(){
        return new Promise(async resolve => {
            this.query(`
                SELECT guild_id
                FROM guilds_subscriptions
            `).then(async ({ rows }) => {
                const guildIDs = rows.map((r) => r.guild_id);
                await this.fetchGuilds(guildIDs);
                resolve(guildIDs);
            });
        });
    }

    getPaymentsForSubscription(subID){
        return new Promise(async resolve => {
            this.query(`
                SELECT p.*
                FROM payments p
                INNER JOIN subscriptions_payments sp ON p.id = sp.payment_id
                WHERE sp.sub_id = '${subID}'
            `).then(({ rows }) => {
                resolve(rows);
            });
        });
    }

    createPayment({ payerDiscordID, payerDiscordUsername, payerEmail, amount, createdAt = new Date(), type, transactionID, details = {}, signupID, modDiscordID }){
        return new Promise(async resolve => {
            this.query(`
                INSERT INTO payments
                (payer_discord_id, payer_discord_username, payer_email, amount, created_at, type, transaction_id, details, signup_id, mod_discord_id) VALUES
                (${stringOrNull(payerDiscordID)}, ${(stringOrNull(pgEscape(payerDiscordUsername)))}, ${stringOrNull(pgEscape(payerEmail))}, ${amount}, '${createdAt.toISOString()}', '${pgEscape(type)}', ${stringOrNull(transactionID)}, '${pgEscape(JSON.stringify(details))}', ${stringOrNull(signupID)}, ${stringOrNull(modDiscordID)})
                RETURNING id;
            `).then(({ rows }) => {
                resolve(rows[0].id);
            });
        });
    }

    createSubscription({ expiresAt = new Date(), createdAt = new Date(), subLabel, guildsCount = 1, patreonUserID }, fetchGuilds = true){
        return new Promise(async resolve => {
            this.query(`
                INSERT INTO subscriptions
                (expires_at, created_at, sub_label, guilds_count, patreon_user_id) VALUES
                (${stringOrNull(expiresAt.toISOString())}, '${createdAt.toISOString()}', ${stringOrNull(pgEscape(subLabel))}, ${guildsCount}, '${stringOrNull(patreonUserID)}')
                RETURNING *;
            `).then(async ({ rows }) => {
                const subscription = new Subscription(rows[0].id, rows[0], this);
                this.subscriptionCache.set(rows[0].id, subscription);
                if(fetchGuilds) await subscription.fetchGuilds();
                resolve(subscription);
            });
        });
    }

    fetchSubscription(subID, rawData, fetchGuilds = true){
        return new Promise(async resolve => {
            // If the sub is in the cache
            if (this.subscriptionCache.get(subID))
                return resolve(this.subscriptionCache.get(subID));
            let data = rawData;
            if(!data){
                const { rows } = await this.query(`
                    SELECT * FROM subscriptions
                    WHERE id = ${subID};
                `);
                data = rows;
            }
            const sub = new Subscription(subID, data[0], this);
            if(fetchGuilds) await sub.fetchGuilds();
            resolve(sub);
        });
    }

    createSubPaymentLink(subID, paymentID){
        return new Promise(async resolve => {
            this.query(`
                INSERT INTO subscriptions_payments
                (sub_id, payment_id) VALUES
                (${subID}, ${paymentID})
                RETURNING id;
            `).then(({ rows }) => {
                resolve(rows[0].id);
            })
        });
    }

    createGuildSubLink(guildID, subID){
        return new Promise(async resolve => {
            this.query(`
                INSERT INTO guilds_subscriptions
                (guild_id, sub_id) VALUES
                ('${guildID}', ${subID})
                RETURNING id;
            `).then(({ rows }) => {
                resolve(rows[0].id);
            })
        });
    }

   /**
     * Fetch or create members
     */
    fetchMembers(memberIDs){
        return new Promise(async resolve => {
            // Keep the members that are not in the cache
            const membersToFetch = memberIDs.filter((m) => !this.memberCache.has(`${m.userID}${m.guildID}`));
            // If there are members to fetch
            if(membersToFetch.length > 0){
                const membersArray = memberIDs.map((m) => `${m.userID}${m.guildID}`);
                /* Fetch basic data - from the members table */
                let { rows: membersData } = await this.query(`
                    SELECT * FROM members
                    WHERE user_id || guild_id IN (${membersArray})
                `);
                /* If there are members not created, insert them in the members table */
                const membersNotCreated = membersToFetch.filter((m) => !membersData.some((md) => `${md.user_id}${md.guild_id}` === `${m.userID}${m.guildID}`));
                if(membersNotCreated.length > 0){
                    const values = membersNotCreated.map((m) => {
                        return `('${m.userID}', '${m.guildID}', 0, 0, 0, 0, 0, 0, 0, 0, false)`;
                    }).join(',\n');
                    // Insert members
                    const { rows: createdMembersData } = await this.query(`
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
                        ${values}
                        RETURNING *;
                    `);
                    membersData = [ ...membersData, ...createdMembersData  ].flat();
                }
                /* Fetch join data - from the member_join_data table */
                const { rows: membersJoinData } = await this.query(`
                    SELECT user_id, guild_id,
                        json_agg(obj_mjd) as member_join_data_agg
                    FROM(
                        select user_id,
                        guild_id,
                        json_build_object(
                            'join_type', join_type,
                            'join_inviter_id', join_inviter_id,
                            'join_invite_data', join_invite_data
                        ) as obj_mjd
                        from member_join_data
                    ) gp
                    where user_id || guild_id IN (${membersArray})
                    group by user_id, guild_id
                `);
                /* Fetch invited users - from the member_invited_users table */
                const { rows: membersInvitedUsers } = await this.query(`
                    SELECT user_id, guild_id,
                        json_agg(obj_mjd) as member_invited_users_agg
                    FROM(
                        select user_id,
                        guild_id,
                        json_build_object(
                            'invited_user_id', invited_user_id
                        ) as obj_mjd
                        from member_invited_users
                    ) gp
                    where user_id || guild_id IN (${membersArray})
                    group by user_id, guild_id
                `);
                /* Fetch invited users left - from the member_invited_users_left table */
                const { rows: membersInvitedUsersLeft } = await this.query(`
                    SELECT user_id, guild_id,
                        json_agg(obj_mjd) as member_invited_users_left_agg
                    FROM(
                        select user_id,
                        guild_id,
                        json_build_object(
                            'invited_user_id', invited_user_id
                        ) as obj_mjd
                        from member_invited_users_left
                    ) gp
                    where user_id || guild_id IN (${membersArray})
                    group by user_id, guild_id
                `);
                /* Create Member instance for all guilds */
                membersToFetch.forEach((memberID) => {
                    const member = new Member(this, {
                        id: memberID,
                        data: membersData.find((memberDataObj) => `${memberDataObj.user_id}${memberDataObj.guild_id}` === `${memberID.userID}${memberID.guildID}`),
                        joinData: membersJoinData.find((memberJoinDataObj) => `${memberJoinDataObj.user_id}${memberJoinDataObj.guild_id}` === `${memberID.userID}${memberID.guildID}`),
                        invitedUsers: membersInvitedUsers.find((memberInvitedUserObj) => `${memberInvitedUserObj.user_id}${memberInvitedUserObj.guild_id}` === `${memberID.userID}${memberID.guildID}`),
                        invitedUsersLeft: membersInvitedUsersLeft.find((memberInvitedUserLeftObj) => `${memberInvitedUserLeftObj.user_id}${memberInvitedUserLeftObj.guild_id}` === `${memberID.userID}${memberID.guildID}`)
                    });
                });
            }
            const members = this.memberCache.filter((mC) => memberIDs.map((m) => `${m.userID}${m.guildID}` === `${mC.userID}${mC.guildID}`)).array();
            resolve(members);
        });
    }

    // Fetch all the members in a guild
    fetchGuildMembers(guildID){
        return new Promise(async resolve => {
            const { rows } = await this.query(`
                SELECT * FROM members
                WHERE guild_id = '${guildID}';
            `);
            resolve(rows);
        });
    }

    /**
     * Fetch or create guilds
     * @param {Snowflake[]} guildIDs Guilds to fetch
     */
    fetchGuilds(guildIDs){
        return new Promise(async resolve => {
            // Keep the guilds that are not in the cache
            const guildsToFetch = guildIDs.filter((g) => !this.guildCache.has(g));
            // If there are guilds to fetch
            if(guildsToFetch.length > 0){
                /* Fetch basic data - from the guilds table */
                let { rows: guildsData } = await this.query(`
                    SELECT * FROM guilds
                    WHERE guild_id IN (${guildsToFetch.map((g) => `'${g}'`).join(', ')})
                `);
                /* If there are guilds not created, insert them in the guilds table */
                const guildsNotCreated = guildsToFetch.filter((g) => !guildsData.some((gd) => gd.guild_id === g));
                if(guildsNotCreated.length > 0){
                    const values = guildsNotCreated.map((g) => {
                        return `('${g}', '${this.client.config.prefix}', '${this.client.config.enabledLanguages.find((l) => l.default).name}', false, false)`;
                    }).join(',\n');
                    // Insert guilds
                    const { rows: createdGuildsData } = await this.query(`
                        INSERT INTO guilds
                        (guild_id, guild_prefix, guild_language, guild_keep_ranks, guild_stacked_ranks) VALUES
                        ${values}
                        RETURNING *;
                    `);
                    guildsData = [ ...guildsData, ...createdGuildsData ].flat();
                }
                /* Fetch guilds plugins - from the guilds_plugins table */
                let { rows: plugins } = await this.query(`
                    SELECT guild_id,
                        json_agg(obj_p) as guild_plugins_agg
                    FROM(
                        select guild_id,
                        json_build_object(
                            'plugin_name', plugin_name,
                            'plugin_data', plugin_data
                        ) as obj_p
                        from guild_plugins
                    ) gp
                    where guild_id IN (${guildsToFetch.map((g) => `'${g}'`).join(', ')})
                    group by guild_id
                `);
                /* If there are guilds with missing plugins */
                const guildsWithMissingPlugins = guildIDs.filter((g) => {
                    return !plugins.some((p) => p.guild_id === g) || plugins.find((p) => p.guild_id === g).guild_plugins_agg.length < 3
                });
                if(guildsWithMissingPlugins.length > 0){
                    const values = guildsWithMissingPlugins.map((g) => {
                        let pluginInsertValues = [];
                        if(!plugins.some((p) => p.guild_id === g && p.guild_plugins_agg.plugin_name === 'joinDM')){
                            pluginInsert.push(`( '${g}', 'joinDM', '{ "enabled": false, "message": null }' )`);
                        }
                        if(!plugins.some((p) => p.guild_id === g && p.guild_plugins_agg.plugin_name === 'join')){
                            pluginInsert.push(`( '${g}', 'leave', '{ "enabled": false, "message": null, "channel": null }' )`);
                        }
                        if(!plugins.some((p) => p.guild_id === g && p.guild_plugins_agg.plugin_name === 'leave')){
                            pluginInsert.push(`( '${g}', 'join', '{ "enabled": false, "message": null, "channel": null }' )`);
                        }
                    });
                    const { rows: createdPlugins } = await this.query(`
                        INSERT INTO guild_plugins
                        (guild_id, plugin_name, plugin_data) VALUES
                        ${values}
                        RETURNING *;
                    `);
                    plugins = [ ...plugins, ...createdPlugins.map((plugin) => {
                        return {
                            guild_id: plugin.guild_id,
                            guild_plugins_agg: plugin
                        }
                    }) ].flat();
                }
                return;
                /* Fetch guilds ranks - from the guild_ranks table */
                const { rows: ranks } = await this.query(`
                    SELECT guild_id,
                        json_agg(obj_r) as guild_ranks_agg
                    FROM(
                        select guild_id,
                        json_build_object(
                            'role_id', role_id,
                            'invite_count', invite_count
                        ) as obj_r
                        from guild_ranks
                    ) gp
                    where guild_id IN (${guildsToFetch.map((g) => `'${g}'`).join(', ')})
                    group by guild_id
                `);
                /* Fetch guilds blacklisted users - from the guild_blacklisted_users table */
                const { rows: blacklistedUsers } = await this.query(`
                    SELECT guild_id,
                        json_agg(obj_b) as guild_blacklisted_agg
                    FROM(
                        select guild_id,
                        json_build_object(
                            'user_id', user_id
                        ) as obj_b
                        from guild_blacklisted_users
                    ) gp
                    where guild_id IN (${guildsToFetch.map((g) => `'${g}'`).join(', ')})
                    group by guild_id
                `);
                /* Fetch guilds subscriptions - from the guilds_subscriptions table */
                let { rows: subscriptions } = await this.query(`
                    SELECT guild_id,
                        json_agg(obj_s) as guild_subscriptions_agg
                    FROM(
                        select guild_id,
                        json_build_object(
                            'sub_id', s.id,
                            'sub_data', s.*
                        ) as obj_s
                        from guilds_subscriptions gs
                        inner join subscriptions s ON s.id = gs.sub_id
                    ) gp
                    where guild_id IN (${guildsToFetch.map((g) => `'${g}'`).join(', ')})
                    group by guild_id
                `);
                /* Create Guild instance for all guilds */
                guildsToFetch.forEach((guildID) => {
                    const guild = new Guild(this, {
                        id: guildID,
                        data: guildsData.find((pluginObj) => pluginObj.guild_id === guildID),
                        plugins: plugins.find((pluginObj) => pluginObj.guild_id === guildID)?.guild_plugins_agg,
                        ranks: ranks.find((rankObj) => rankObj.guild_id === guildID)?.guild_ranks_agg || [],
                        blacklistedUsers: blacklistedUsers.find((blacklistedUserObj) => blacklistedUserObj.guild_id === guildID)?.guild_blacklisted_agg || [],
                        subscriptions: subscriptions.find((subscriptionObj) => subscriptionObj.guild_id === guildID)?.guild_subscriptions_agg || []
                    });
                });
            }
            const guilds = this.guildCache.filter((g) => guildIDs.includes(g.id)).array();
            resolve(guilds);
        });
    }

    fetchMember(userID, guildID) {
        return new Promise(async resolve => {
            const [ member ] = await this.fetchMembers({
                userID,
                guildID
            });
            resolve(member);
        });
    }

    fetchGuild(guildID) {
        return new Promise(async resolve => {
            const [ guild ] = await this.fetchGuilds([ guildID ]);
            resolve(guild);
        });
    }

};