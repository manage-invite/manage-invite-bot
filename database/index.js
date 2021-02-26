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

    fetchPremiumUserIDs () {
        return this.postgres.fetchPremiumUserIDs();
    }

    fetchPremiumGuildIDs () {
        return this.postgres.fetchPremiumGuildIDs();
    }

}