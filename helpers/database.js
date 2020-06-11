const { Pool } = require("pg");
const { Collection } = require("discord.js");
const { asyncForEach } = require("./functions");
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
    
    stringOrNull(value){
        return value ? `'${value}'` : 'null';
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
                SELECT gs.*
                FROM guilds_subscriptions gs
                INNER JOIN subscriptions s ON gs.sub_id = s.id
                WHERE s.expires_at > now()
            `).then(async ({ rows }) => {
                const guildIDs = [];
                for(let row of rows){
                    guildIDs.push(row.guild_id);
                    await this.fetchGuild(row.guild_id);
                }
                return guildIDs;
            });
        });
    }

    createPayment({ payerID, amount, createdAt = new Date(), type, transactionID, details, signupID }){
        return new Promise(async resolve => {
            this.query(`
                INSERT INTO payments
                (payer_id, amount, created_at, type, transaction_id, details, signup_id) VALUES
                (${this.stringOrNull(payerID)}, ${amount}, '${createdAt.toISOString()}', '${type}', ${this.stringOrNull(transactionID)}, ${details || {}}, ${this.stringOrNull(signupID)})
                RETURNING id;
            `).then((paymentID) => {
                resolve(paymentID);
            });
        });
    }

    createSubscription({ expiresAt = new Date(), createdAt = new Date(), subLabel, guildsCount = 1, patreonUserID }){
        return new Promise(async resolve => {
            this.query(`
                INSERT INTO subscriptions
                (expires_at, created_at, sub_label, guilds_count, patreon_user_id) VALUES
                (${expiresAt.toISOString()}, ${createdAt.toISOString()}, '${this.stringOrNull(subLabel)}', ${guildsCount}, ${this.stringOrNull(patreonUserID)})
                RETURNING *;
            `).then(async (row) => {
                console.log(row)
                const subscription = new Subscription(row.sub_id, row, this);
                await subscription.fetchGuilds();
                this.subscriptionCache.set(row.sub_id, subscription);
                resolve(subscription);
            });
        });
    }

    fetchSubscription(subID){
        return new Promise(async resolve => {
            // If the sub is in the cache
            if (this.subscriptionCache.get(subID))
                return resolve(this.subscriptionCache.get(subID));
            const { rows } = await this.query(`
                SELECT * FROM subscriptions
                WHERE sub_id = '${subID}';
            `);
            const sub = new Subscription(subID, rows[0], this);
            // Fetch subscription
            await sub.fetch();
            resolve(sub);
            // Add the sub to the cache
            this.subscriptionCache.set(subID, sub);
        });
    }

    createSubPaymentLink(subID, paymentID){
        return new Promise(async resolve => {
            this.query(`
                INSERT INTO subscriptions_payments
                (sub_id, payment_id) VALUES
                (${subID}, ${paymentID})
                RETURNING id;
            `).then((id) => {
                resolve(id);
            })
        });
    }

    createGuildSubLink(guildID, subID){
        return new Promise(async resolve => {
            this.query(`
                INSERT INTO guilds_subscriptions
                (guild_id, sub_id) VALUES
                (${guildID}, ${subID})
                RETURNING id;
            `).then((id) => {
                resolve(id);
            })
        });
    }
    
    // Create or get all the members of a guild
    fetchMembers(guildID, raw) {
        return new Promise(async resolve => {
            let startAt = Date.now();
            const { rows } = await this.query(`
                SELECT * FROM members
                WHERE guild_id = '${guildID}';
            `);
            console.log(`Fetched in ${Date.now()-startAt}ms`);
            if(raw){
                resolve(rows);
            } else {
                const members = [];
                await asyncForEach(rows, async row => {
                   if (this.memberCache.get(`${row.user_id}${guildID}`)){
                        const memberCache = this.memberCache.get(`${row.user_id}${guildID}`);
                        members.push(memberCache);
                    } else {
                        const member = new Member(row.user_id, row.guild_id, row, this, true);
                        members.push(member);
                    }
                });
                resolve(members);
            }
        });
    }

    // Create or get a member
    fetchMember(userID, guildID) {
        return new Promise(async resolve => {
            // If the member is in the cache
            if (this.memberCache.get(`${userID}${guildID}`))
                return resolve(this.memberCache.get(`${userID}${guildID}`));
            const { rows } = await this.query(`
                SELECT * FROM members
                WHERE guild_id = '${guildID}'
                AND user_id = '${userID}';
            `);
            const member = new Member(userID, guildID, rows[0], this);
            // Fetch member
            await member.fetch();
            resolve(member);
            // Add the member to the cache
            this.memberCache.set(`${userID}${guildID}`, member);
        });
    }

    // Create or get a guild
    fetchGuild(guildID, subscription) {
        return new Promise(async resolve => {
            // If the guild is in the cache
            if (this.guildCache.get(guildID))
                return resolve(this.guildCache.get(guildID));
            const { rows } = await this.query(`
                SELECT * FROM guilds
                WHERE guild_id = '${guildID}';
            `);
            const guild = new Guild(guildID, subscription ? { ...rows[0], ...{ subscription } } : rows[0], this);
            // Insert the guild into the database if it's needed
            if (!guild.inserted) await guild.insert();
            // Fetch guild
            await guild.fetch();
            resolve(guild);
            // Add the guild to the cache
            this.guildCache.set(guildID, guild);
        });
    }

};