const { Collection } = require("discord.js");

module.exports = class Subscription {
    constructor(subID, data, handler) {
        if(!data) data = {};
        this.id = subID;
        this.handler = handler;
        this.inserted = Object.keys(data).length !== 0;
        this.data = data;
        // Expiration date
        this.expiresAt = data.expires_at ? new Date(data.expires_at).getTime() : null;
        // Guilds related to the subscription
        this.guilds = [];
        // Subscription label
        this.label = data.sub_label;
    }

    get active () {
        return this.expiresAt > Date.now();
    }

    get isTrial () {
        return this.label === 'Trial Version';
    }

    get wasTrial () {
        return this.label.startsWith('T-');
    }

    async changeLabel (newName) {
        this.label = this.isTrial ? 'Trial Version' : `T-${newName}`;
        await this.handler.query(`
            UPDATE subscriptions
            SET sub_label = '${this.label}'
            WHERE sub_id = ${this.id};
        `);
        this.handler.syncSubscriptionForOtherCaches(this.id);
    }

    async addDays(count){
        const ms = count*24*60*60*1000;
        if(this.expiresAt >= Date.now()){
            this.expiresAt += ms;
        } else {
            this.expiresAt = Date.now() + ms;
        }
        this.handler.syncSubscriptionForOtherCaches(this.id);
    }

    async fetchGuilds(){
        const { rows } = await this.handler.query(`
            SELECT * FROM guilds_subscriptions
            WHERE sub_id = '${this.id}'
        `);
        for(let row of rows) {
            this.guilds.push(row.guild_id);
            await this.handler.fetchGuild(row.guild_id);
        }
    }

};