const { Pool } = require("pg");
const { postgres: postgresConfig } = require("../config");
const log = require('../helpers/logger');

module.exports = class PostgreSQL {

    constructor () {

        this.connect = new Promise((resolve) => this.connectResolve = resolve);
        this.connected = false;
        this.log = (content) => log(content, 'postgres');

        this.client = new Pool(postgresConfig);
        this.client.on('connect', () => {
            if (!this.connected) {
                this.connected = true;
                this.log(`Connected.`);
                this.connectResolve();
            }
        });
        this.client.connect();

    }

    query (query, ...args) {
        return new Promise((resolve, reject) => {
            this.client.query(query, args, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }

    fetchPremiumGuildIDs () {
        return this.query(`
            SELECT guild_id
            FROM guilds_subscriptions
        `).then(({ rows }) => rows);
    }

    fetchPremiumUserIDs () {
        return this.query(`
            SELECT payer_discord_id
            FROM payments
            WHERE type = 'paypal_dash_pmnt_month' OR type = 'email_address_pmnt_month';
        `).then({ rows }) => rows);
    }

    fetchGuilds () {

    }

}