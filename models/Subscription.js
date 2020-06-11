const { Collection } = require("discord.js");

module.exports = class Subscription {
    constructor(subID, data, handler) {
        if(!data) data = {};
        this.id = subID;
        this.handler = handler;
        this.inserted = Object.keys(data).length !== 0;
        this.data = data;
        // Expiration date
        this.expiresAt = data.expires_at ? new Date(expires_at).getTime() : null;
    }

    get active () {
        return this.expiresAt > Date.now();
    }

    async addDays(count){
        const ms = count*24*60*60*1000;
        if(this.expiresAt >= Date.now()){
            this.expiresAt += ms;
        } else {
            this.expiresAt = Date.now() + ms;
        }
    }

    async fetchGuilds(){
        const { rows } = await this.handler.query(`
            SELECT * FROM guilds_subscriptions
            WHERE sub_id = '${this.id}'
        `);
        for(let row of rows) {
            this.guilds.push(row.guild_id);
            const guild = await this.handler.fetchGuild(row.guild_id);
            await guild.syncSubscriptions();
        }
    }

};