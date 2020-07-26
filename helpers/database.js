const { Pool } = require("pg");
const { Collection } = require("discord.js");
const { stringOrNull, pgEscape } = require("./functions");
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
                this.database.removeSubscriptionFromCache(${subID}).then(() => {
                    this.database.fetchSubscription(${subID}, null, true);
                });
            }
        `);
    }

    async removeSubscriptionFromCache(subID){
        if(this.subscriptionCache.has(subID)){
            await this.subscriptionCache.get(subID).deleteGuildsFromCache();
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

    createSubscription({ expiresAt = new Date(), createdAt = new Date(), subLabel, guildsCount = 1, patreonUserID }, deleteGuildFromCache = true){
        return new Promise(async resolve => {
            this.query(`
                INSERT INTO subscriptions
                (expires_at, created_at, sub_label, guilds_count, patreon_user_id) VALUES
                (${stringOrNull(expiresAt.toISOString())}, '${createdAt.toISOString()}', ${stringOrNull(pgEscape(subLabel))}, ${guildsCount}, '${stringOrNull(patreonUserID)}')
                RETURNING *;
            `).then(async ({ rows }) => {
                const subscription = new Subscription(this, {
                    id: rows[0].id,
                    data: rows[0]
                });
                this.subscriptionCache.set(rows[0].id, subscription);
                if(deleteGuildFromCache) await subscription.deleteGuildFromCache();
                resolve(subscription);
            });
        });
    }

    fetchSubscription(subID, rawData, deletGuildsFromCache = false){
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
            const sub = new Subscription(this, {
                id: subID,
                data: data[0]
            });
            if(deletGuildsFromCache) await sub.deleteGuildsFromCache();
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
            });
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
            });
        });
    }

    async createEvent ({ userID, guildID, eventDate = new Date(), eventType, joinType, inviterID, inviteData }) {
        return new Promise(async resolve => {
            // Update database
            await this.query(`
                INSERT INTO invited_member_events
                (user_id, guild_id, event_date, event_type, join_type, inviter_user_id, invite_data) VALUES
                ('${userID}', '${guildID}', '${eventDate.toISOString()}', '${eventType}', ${stringOrNull(joinType)}, ${stringOrNull(inviterID)}, ${stringOrNull(pgEscape(JSON.stringify(inviteData)))})
            `);
            // Update member cache
            if (this.memberCache.has(`${userID}${guildID}`)) {
                this.memberCache.get(`${userID}${guildID}`).invitedMemberEvents.push({
                    userID,
                    guildID,
                    eventDate,
                    eventType,
                    inviterID,
                    inviteData,
                    joinType
                });
            }
            this.removeMemberFromOtherCaches(userID, guildID);
            if (eventType === "join" && inviterID) {
                // Update inviter cache
                if (this.memberCache.has(`${inviterID}${guildID}`)) {
                    this.memberCache.get(`${inviterID}${guildID}`).invitedMembers.push({
                        userID,
                        guildID,
                        eventDate,
                        eventType,
                        inviterID,
                        inviteData,
                        joinType
                    });
                }
                this.removeMemberFromOtherCaches(inviterID, guildID);
            }
            resolve();
        });
    }

    addBonusInvitesMembers(guildID, count){
        return new Promise(async resolve => {
            this.query(`
                UPDATE members
                SET invites_bonus = invites_bonus + ${count}
                WHERE guild_id IN ('${guildID}');
            `).then(() => {
                this.removeAllMembersFromCache(guildID);
                this.removeAllMembersFromOtherCaches(guildID);
                resolve();
            });
        });
    }

    removeBonusInvitesMembers(guildID, count){
        return new Promise(async resolve => {
            this.query(`
                UPDATE members
                SET invites_bonus = invites_bonus - ${count}
                WHERE guild_id IN ('${guildID}');
            `).then(() => {
                this.removeAllMembersFromCache(guildID);
                this.removeAllMembersFromOtherCaches(guildID);
                resolve();
            });
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
                const membersArray = memberIDs.map((m) => `'${m.userID}${m.guildID}'`).join(", ");
                /* Fetch basic data - from the members table */
                let { rows: membersData } = await this.query(`
                    SELECT * FROM members
                    WHERE user_id || guild_id IN (${membersArray})
                `);
                /* If there are members not created, insert them in the members table */
                const membersNotCreated = membersToFetch.filter((m) => !membersData.some((md) => `${md.user_id}${md.guild_id}` === `${m.userID}${m.guildID}`));
                if(membersNotCreated.length > 0){
                    const values = membersNotCreated.map((m) => {
                        return `('${m.userID}', '${m.guildID}', 0, 0, 0, 0, 0, 0, 0, 0, false)`;
                    }).join(", ");
                    // Insert members
                    const { rows: createdMembersData } = await this.query(`
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
                    membersData = [ ...membersData, ...createdMembersData  ].flat();
                }
                /* Fetch join data - from the member_join_data table */
                const { rows: membersJoinData } = await this.query(`
                    SELECT user_id, guild_id,
                    json_build_object(
                        'join_type', join_type,
                        'join_inviter_id', join_inviter_id,
                        'join_invite_data', join_invite_data
                    ) as obj_mjd
                    from member_join_data
                    where user_id || guild_id IN (${membersArray})
                `);
                /* Fetch invited users events*/
                const { rows: invitedMemberEvents } = await this.query(`
                    SELECT user_id, guild_id,
                        json_agg(obj_ime) as invited_member_events
                    FROM(
                        select 
                        user_id,
                        guild_id,
                        inviter_user_id,
                        json_build_object(
                            'guild_id', guild_id,
                            'user_id', user_id,
                            'event_type', event_type,
                            'event_date', event_date,
                            'join_type', join_type,
                            'inviter_user_id', inviter_user_id,
                            'invite_data', invite_data
                        ) as obj_ime
                        from invited_member_events
                    ) gp
                    where user_id || guild_id IN (${membersArray})
                    group by user_id, guild_id
                `);
                const { rows: invitedMembers } = await this.query(`
                    SELECT inviter_user_id as user_id, guild_id,
                        json_agg(obj_ime) as invited_members
                    FROM(
                        select 
                        user_id,
                        guild_id,
                        inviter_user_id,
                        json_build_object(
                            'guild_id', guild_id,
                            'user_id', user_id,
                            'event_type', event_type,
                            'event_date', event_date,
                            'join_type', join_type,
                            'inviter_user_id', inviter_user_id,
                            'invite_data', invite_data
                        ) as obj_ime
                        from invited_member_events
                    ) gp
                    where inviter_user_id || guild_id IN (${membersArray})
                    group by inviter_user_id, guild_id
                `);
                /* Create Member instance for all guilds */
                membersToFetch.forEach((memberID) => {
                    new Member(this, {
                        userID: memberID.userID,
                        guildID: memberID.guildID,
                        data: membersData.find((memberDataObj) => `${memberDataObj.user_id}${memberDataObj.guild_id}` === `${memberID.userID}${memberID.guildID}`),
                        joinData: membersJoinData.find((memberJoinDataObj) => `${memberJoinDataObj.user_id}${memberJoinDataObj.guild_id}` === `${memberID.userID}${memberID.guildID}`)?.member_join_data_agg || null,
                        invitedMemberEvents: invitedMemberEvents.find((invitedMemberEventObj) => `${invitedMemberEventObj.user_id}${invitedMemberEventObj.guild_id}` === `${memberID.userID}${memberID.guildID}`)?.invited_member_events || [],
                        invitedMembers: invitedMembers.find((invitedMemberObj) => `${invitedMemberObj.user_id}${invitedMemberObj.guild_id}` === `${memberID.userID}${memberID.guildID}`)?.invited_members || []
                    });
                });
            }
            const members = this.memberCache.filter((mC) => memberIDs.map((m) => `${m.userID}${m.guildID}`).includes(`${mC.userID}${mC.guildID}`)).array();
            resolve(members);
        });
    }

    countGuildInvites(guildID){
        return new Promise(async resolve => {
            const { rows } = await this.query(`
                SELECT
                    guild_id,
                    SUM(old_invites_regular) as regular,
                    SUM(old_invites_fake) as fake,
                    SUM(old_invites_bonus) as bonus,
                    SUM(old_invites_leaves) as leaves
                FROM members
                WHERE guild_id = '${guildID}'
                GROUP BY 1
            `);
            resolve({
                regular: rows[0]?.regular || 0,
                fake: rows[0]?.fake || 0,
                bonus: rows[0]?.bonus || 0,
                leaves: rows[0]?.leaves || 0
            });
        });
    }

    backupInvites(guildID){
        return new Promise(async resolve => {
            this.query(`
                UPDATE members
                SET old_invites_fake = invites_fake,
                    old_invites_leaves = invites_leaves,
                    old_invites_bonus = invites_bonus,
                    old_invites_regular = invites_regular,
                    old_invites_backuped = true
                
                WHERE guild_id IN ('${guildID}')
            `).then(() => {
                this.query(`
                    UPDATE members
                    SET invites_fake = 0,
                        invites_leaves = 0,
                        invites_bonus = 0,
                        invites_regular = 0

                    WHERE guild_id IN ('${guildID}')
                `).then(async () => {
                    await this.removeAllMembersFromCache(guildID);
                    await this.removeAllMembersFromOtherCaches(guildID);
                    resolve();
                });
            });
            
        });
    }

    restoreInvites(guildID){
        return new Promise(async resolve => {
            this.query(`
                UPDATE members
                SET invites_fake = old_invites_fake,
                    invites_leaves = old_invites_leaves,
                    invites_bonus = old_invites_bonus,
                    invites_regular = old_invites_regular,
                    old_invites_backuped = false
                
                WHERE guild_id IN ('${guildID}')
            `).then(() => {
                this.query(`
                    UPDATE members
                    SET old_invites_fake = 0,
                        old_invites_leaves = 0,
                        old_invites_bonus = 0,
                        old_invites_regular = 0

                    WHERE guild_id IN ('${guildID}')
                `).then(async () => {
                    await this.removeAllMembersFromCache(guildID);
                    await this.removeAllMembersFromOtherCaches(guildID);
                    resolve();
                });
            });
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
                let { rows: guildsData } = await this.query(`
                    SELECT * FROM guilds
                    WHERE guild_id IN (${guildsToFetch.map((g) => `'${g}'`).join(", ")})
                `);
                /* If there are guilds not created, insert them in the guilds table */
                const guildsNotCreated = guildsToFetch.filter((g) => !guildsData.some((gd) => gd.guild_id === g));
                if(guildsNotCreated.length > 0){
                    const values = guildsNotCreated.map((g) => {
                        return `('${g}', '${this.client.config.prefix}', '${this.client.config.enabledLanguages.find((l) => l.default).name}', false, false)`;
                    }).join(", ");
                    // Insert guilds
                    const { rows: createdGuildsData } = await this.query(`
                        INSERT INTO guilds
                        (guild_id, guild_prefix, guild_language, guild_keep_ranks, guild_stacked_ranks) VALUES
                        ${values}
                        RETURNING *;
                    `);
                    guildsData = [ ...guildsData, ...createdGuildsData ].flat();
                }
                /* Fetch guilds plugins - from the guilds_plugins table */
                const { rows: plugins } = await this.query(`
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
                    where guild_id IN (${guildsToFetch.map((g) => `'${g}'`).join(", ")})
                    group by guild_id
                `);
                /* If there are guilds with missing plugins */
                const guildsWithMissingPlugins = guildsToFetch.filter((g) => {
                    return !plugins.some((p) => p.guild_id === g) ||
                    !plugins.find((p) => p.guild_id === g).guild_plugins_agg.some((p) => p.plugin_name === "joinDM") ||
                    !plugins.find((p) => p.guild_id === g).guild_plugins_agg.some((p) => p.plugin_name === "leave") ||
                    !plugins.find((p) => p.guild_id === g).guild_plugins_agg.some((p) => p.plugin_name === "join");
                });
                if(guildsWithMissingPlugins.length > 0){
                    const pluginInsertValues = [];
                    guildsWithMissingPlugins.forEach((g) => {
                        if(!plugins.some((p) => p.guild_id === g) || !plugins.find((p) => p.guild_id === g).guild_plugins_agg.some((p) => p.plugin_name === "joinDM")){
                            pluginInsertValues.push(`( '${g}', 'joinDM', '{ "enabled": false, "message": null }' )`);
                        }
                        if(!plugins.some((p) => p.guild_id === g) || !plugins.find((p) => p.guild_id === g).guild_plugins_agg.some((p) => p.plugin_name === "leave")){
                            pluginInsertValues.push(`( '${g}', 'leave', '{ "enabled": false, "message": null, "channel": null }' )`);
                        }
                        if(!plugins.some((p) => p.guild_id === g) || !plugins.find((p) => p.guild_id === g).guild_plugins_agg.some((p) => p.plugin_name === "join")){
                            pluginInsertValues.push(`( '${g}', 'join', '{ "enabled": false, "message": null, "channel": null }' )`);
                        }
                    });
                    const { rows: createdPlugins } = await this.query(`
                        INSERT INTO guild_plugins
                        (guild_id, plugin_name, plugin_data) VALUES
                        ${pluginInsertValues.join(", ")}
                        RETURNING *;
                    `);
                    guildsWithMissingPlugins.forEach((g) => {
                        if(plugins.some((p) => p.guild_id === g)){
                            createdPlugins.filter((p) => p.guild_id === g).forEach((p) => {
                                plugins.find((p) => p.guild_id === g).guild_plugins_agg.push({
                                    plugin_name: p.plugin_name,
                                    plugin_data: p.plugin_data 
                                });
                            });
                        } else {
                            plugins.push({
                                guild_id: g,
                                guild_plugins_agg: createdPlugins.filter((p) => p.guild_id === g)
                            });
                        }
                    });
                }
                /* Fetch guilds ranks - from the guild_ranks table */
                const { rows: ranks } = await this.query(`
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
                    where guild_id IN (${guildsToFetch.map((g) => `'${g}'`).join(", ")})
                    group by guild_id
                `);
                /* Fetch guilds blacklisted users - from the guild_blacklisted_users table */
                const { rows: blacklistedUsers } = await this.query(`
                    SELECT guild_id,
                        json_agg(obj_b) as guild_blacklisted_agg
                    FROM(
                        select guild_id,
                        json_build_object(
                            'user_id', user_id
                        ) as obj_b
                        from guild_blacklisted_users
                    ) gp
                    where guild_id IN (${guildsToFetch.map((g) => `'${g}'`).join(", ")})
                    group by guild_id
                `);
                /* Fetch guilds subscriptions - from the guilds_subscriptions table */
                const { rows: subscriptions } = await this.query(`
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
                    where guild_id IN (${guildsToFetch.map((g) => `'${g}'`).join(", ")})
                    group by guild_id
                `);
                /* Create Guild instance for all guilds */
                guildsToFetch.forEach((guildID) => {
                    new Guild(this, {
                        id: guildID,
                        data: guildsData.find((pluginObj) => pluginObj.guild_id.trim() === guildID),
                        plugins: plugins.find((pluginObj) => pluginObj.guild_id.trim() === guildID)?.guild_plugins_agg,
                        ranks: ranks.find((rankObj) => rankObj.guild_id.trim() === guildID)?.guild_ranks_agg || [],
                        blacklistedUsers: blacklistedUsers.find((blacklistedUserObj) => blacklistedUserObj.guild_id.trim() === guildID)?.guild_blacklisted_agg || [],
                        subscriptions: subscriptions.find((subscriptionObj) => subscriptionObj.guild_id.trim() === guildID)?.guild_subscriptions_agg || []
                    });
                });
            }
            const guilds = this.guildCache.filter((g) => guildIDs.includes(g.id)).array();
            resolve(guilds);
        });
    }

    fetchMember(userID, guildID) {
        return new Promise(async resolve => {
            const [ member ] = await this.fetchMembers([
                {
                    userID,
                    guildID
                }
            ]);
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