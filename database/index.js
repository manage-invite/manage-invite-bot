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

    fetchGuildSettings () {

    }

    fetchPremiumGuildIDs () {
        return new Promise(async (resolve) => {
            const guildIDs = await this.postgres.fetchPremiumGuildIDs();
            resolve(guildIDs);
        });
    }

}