const Guild = require('./models/Guild');
const Redis = require('ioredis-json');
const { redis: redisConfig } = require("../config");
const log = require('../helpers/logger');

class RedisHandler {

    constructor () {

        this.connect = new Promise((resolve) => this.connectResolve = resolve);
        this.log = (content) => log(content, 'redis');

        this.client = new Redis(redisConfig);
        this.client.on('error', (e) => this.log(e));
        this.client.on('ready', () => this.log('Ready.'));
        this.client.on('connect', () => {
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

}

module.exports = RedisHandler;
