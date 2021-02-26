const redis = require('redis');
const { redis: redisConfig } = require("../config");
const log = require('../helpers/logger');

module.exports = class RedisHandler {

    constructor () {

        this.connect = new Promise((resolve) => this.connectResolve = resolve);
        this.log = (content) => log(content, 'redis');

        this.client = redis.createClient(redisConfig);
        this.client.on('error', (e) => this.log(e));
        this.client.on('ready', () => this.log('Ready.'));
        this.client.on('connect', () => {
            this.log('Connected.');
            this.connectResolve();
        });

    }

}