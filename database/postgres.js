const { Pool } = require("pg");
const { postgres: postgresConfig } = require("../config");
const log = require('../helpers/logger');

module.exports = class PostgreSQL {

    constructor () {

        this.connect = new Promise((resolve) => this.connectResolve = resolve);
        this.log = (content) => log(content, 'postgres');

        this.client = new Pool(postgresConfig);
        this.client.on("connect", () => {
            this.log(`Connected.`);
            this.connectResolve();
        });
        this.client.connect();

    }

    query (query, ...arguments) {
        return new Promise((resolve, reject) => {
            this.pool.query(string, arguments, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }

    fetchPremiumGuilds () {
        this.query(`
            SELECT guild_id
            FROM guilds_subscriptions
        `).then(async ({ rows }) => {
            return rows;
        });
        return
    }


}