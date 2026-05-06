"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.set = void 0;
const redis_connection_1 = require("./redis.connection");
const set = async ({ key, value, ttl }) => {
    try {
        value = typeof value === "string" ? value : JSON.stringify(value);
        return ttl ? await redis_connection_1.redisClient.set(key, value, { EX: ttl }) : await redis_connection_1.redisClient.set(key, value);
    }
    catch (error) {
        console.log(`Fail in redis set operation ${error}`);
    }
};
exports.set = set;
