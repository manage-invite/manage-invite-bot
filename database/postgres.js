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
            const startAt = Date.now();
            this.client.query(query, args, (error, results) => {
                this.log(`Query ran in ${parseInt(Date.now() - startAt)}ms`);
                if (error) reject(error);
                else resolve(results);
            });
        });
    }

}