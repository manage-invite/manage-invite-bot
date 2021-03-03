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
            this.client.arrappend(key, path, value).catch((err) => {
                this.client.set(key, path, '[]').then(() => this.push(key, path, value).then(resolve));
            }).then(() => resolve());
        });
    }

    get (key, path) {
        this.log(`Getting ${key}`);
        return this.client.get(key, path);
    }

    set (key, path, value) {
        this.log(`Setting ${key} to ${value}`);
        return this.client.set(key, path, value);
    }

}

module.exports = RedisHandler;
