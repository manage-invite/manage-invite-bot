const Guild = require('./models/Guild');
const { ReJSON } = require('redis-modules-sdk');
const { redis: redisConfig } = require("../config");
const log = require('../helpers/logger');

class RedisHandler {

    constructor () {

        this.connect = new Promise((resolve) => this.connectResolve = resolve);
        this.log = (content) => log(content, 'redis');

        this.client = new ReJSON(redisConfig);
        this.client.connect().then(() => {
            this.log('Connected.');
            this.connectResolve();
        });

    }

    push (key, path, value) {
        return new Promise((resolve) => {
            this.client.arrappend(key, JSON.stringify(value), path).catch((err) => {
                this.client.set(key, path, '[]').then(() => this.push(key, path, value).then(resolve));
            }).then(() => resolve());
        });
    }

    async get (key, path) {
        const startAt = Date.now();
        return this.client.get(key, path).then((data) => {
            this.log(`${key} retrieved in ${parseInt(Date.now() - startAt)}ms`);
            return data ? JSON.parse(data) : null
        })
    }

    set (key, path, value) {
        this.log(`Caching ${key}`);
        return this.client.set(key, path, value ? JSON.stringify(value) : null);
    }

    numincrby (key, path, value) {
        this.log(`Incrementing ${key} by ${value}`);
        return this.client.numincrby(key, path, value);
    }

}

module.exports = RedisHandler;
