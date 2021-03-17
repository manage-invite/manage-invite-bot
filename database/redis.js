const { ReJSON } = require("redis-modules-sdk");
const { redis: redisConfig } = require("../config");
const log = require("../helpers/logger");

class RedisHandler {

    constructor () {

        this.connect = new Promise((resolve) => this.connectResolve = resolve);
        this.log = (content) => log(content, "redis");

        this.client = new ReJSON(redisConfig);
        this.client.connect().then(() => {
            this.log("Connected.");
            this.connectResolve();
        });

    }

    /**
     * Push something in a REDIS-JSON array
     */
    pushJSON (key, path, value) {
        return new Promise((resolve) => {
            this.client.arrappend(key, JSON.stringify(value), path).catch(() => {
                this.client.set(key, path, "[]").then(() => this.pushJSON(key, path, value).then(resolve));
            }).then(() => resolve());
        });
    }

    /**
     * Get a REDIS-JSON key
     */
    async getJSON (key, path) {
        const startAt = Date.now();
        return this.client.get(key, path).then((data) => {
            this.log(`Json ${key} retrieved in ${parseInt(Date.now() - startAt)}ms`);
            return data ? JSON.parse(data) : null;
        });
    }

    /**
     * Define a REDIS-JSON key
     */
    setJSON (key, path, value) {
        this.log(`Caching json ${key}`);
        return this.client.set(key, path, value ? JSON.stringify(value) : null);
    }

    /**
     * Get a REDIS hash key
     */
    getHash (key, field) {
        const startAt = Date.now();
        const get = field ? this.client.redis.hget(key, field) : this.client.redis.hgetall(key);
        return get.then((data) => {
            this.log(`Hash ${key} retrieved in ${parseInt(Date.now() - startAt)}ms`);
            return data;
        });
    }

    /**
     * Set REDIS hash key(s)
     */
    setHash (key, data) {
        this.log(`Caching hash ${key}`);
        const fields = Object.keys(data);
        if (fields.length > 1) return this.client.redis.hmset(key, ...fields.map((field) => [ field, data[field] ]).flat());
        else return this.client.redis.hset(key, fields[0], data[fields[0]]);
    }

    /**
     * Increment a REDIS hash
     */
    incrHashBy (key, field, num) {
        this.log(`Incr ${key}#${field} by ${num}`);
        return this.client.redis.hincrby(key, field, num);
    }

    /**
     * Get a REDIS string key
     */
    getString (key, options) {
        const startAt = Date.now();
        return this.client.redis.get(key).then((data) => {
            this.log(`String ${key} retrieved in ${parseInt(Date.now() - startAt)}ms`);
            return options?.json ? JSON.parse(data) : data;
        });
    }

    /**
     * Set a REDIS string key
     */
    setString (key, data) {
        this.log(`Caching string ${key}`);
        return this.client.redis.set(key, data);
    }

    /**
     * Get the REDIS keyspace statistics
     */
    getStats () {
        return new Promise((resolve) => {
            this.client.redis.info("keyspace").then((data) => {
                const [,keys] = data.match(/db0:keys=([0-9]+)/);
                resolve(keys);
            });
        });
    }

}

module.exports = RedisHandler;
