const { Pool } = require("pg");
const { Collection } = require("discord.js");
const { asyncForEach } = require("./functions");

const Guild = require("../models/Guild");
const Member = require("../models/Member");

module.exports = class DatabaseHandler {
    constructor(client) {
        Object.defineProperty(this, "client", { value: client });
        const { database } = this.client.config;
        this.pool = new Pool(database);

        // Cache
        this.guildCache = new Collection();
        this.memberCache = new Collection();
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

    // Create or get all the members of a guild
    fetchMembers(guildID, raw) {
        return new Promise(async resolve => {
            const { rows } = await this.query(`
                SELECT * FROM members
                WHERE guild_id = '${guildID}';
            `);
            if(raw){
                resolve(rows);
            } else {
                const members = [];
                await asyncForEach(rows, async row => {
                   // if (this.memberCache.get(`${row.user_id}${guildID}`)){
                    //    const memberCache = this.memberCache.get(`${row.user_id}${guildID}`);
                    //    members.push(memberCache);
                    //} else {
                        const member = new Member(row.user_id, row.guild_id, row, this);
                        await member.fetch();
                        members.push(member);
                    //}
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
    fetchGuild(guildID) {
        return new Promise(async resolve => {
            // If the guild is in the cache
            if (this.guildCache.get(guildID))
                return resolve(this.guildCache.get(guildID));
            const { rows } = await this.query(`
                SELECT * FROM guilds
                WHERE guild_id = '${guildID}';
            `);
            const guild = new Guild(guildID, rows[0], this);
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