"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = exports.RedisService = void 0;
const redis_1 = require("redis");
const config_service_1 = require("../../config/config.service");
const enum_1 = require("../enum");
class RedisService {
    client;
    constructor() {
        this.client = (0, redis_1.createClient)({
            url: config_service_1.REDIS_URI
        });
        this.handleEvents();
    }
    handleEvents() {
        this.client.on("error", (error) => console.log(`Fail connecting to redis 🙄`));
        this.client.on("connect", () => console.log(`Redis connected successfully ✅`));
        this.client.on("ready", () => console.log(`Redis is working 🥳`));
    }
    async connect() {
        await this.client.connect();
    }
    otpKey({ email, subject = enum_1.EmailEnum.ConfirmEmail }) {
        return `OTP::User::${email}::${subject}`;
    }
    ;
    maxTrialOtpKey({ email, subject = enum_1.EmailEnum.ConfirmEmail }) {
        return `${this.otpKey({ email, subject })}::MaxTrial`;
    }
    ;
    blockOtpKey({ email, subject = enum_1.EmailEnum.ConfirmEmail }) {
        return `${this.otpKey({ email, subject })}::Block`;
    }
    ;
    baseRevokeTokenKey(userId) {
        return `RevokeToken::User::${userId.toString()}`;
    }
    ;
    revokeTokenKey({ userId, jti }) {
        return `${this.baseRevokeTokenKey(userId)}::${jti}`;
    }
    ;
    async set({ key, value, ttl = undefined }) {
        try {
            value = typeof value === "string" ? value : JSON.stringify(value);
            return ttl ? await this.client.set(key, value, { EX: ttl }) : await this.client.set(key, value);
        }
        catch (error) {
            console.log(`Fail to set this redis query :: ${error}`);
        }
    }
    ;
    async exists(key) {
        try {
            return await this.client.exists(key);
        }
        catch (error) {
            console.log(`Fail to set this redis query :: ${error}`);
            return;
        }
    }
    ;
    async ttl(key) {
        try {
            return await this.client.ttl(key);
        }
        catch (error) {
            console.log(`Fail to set this redis query :: ${error}`);
            return -2;
        }
    }
    ;
    async expire({ key, ttl }) {
        try {
            return await this.client.expire(key, ttl);
        }
        catch (error) {
            console.log(`Fail to set this redis query :: ${error}`);
        }
        return;
    }
    ;
    async deleteKey(keys) {
        try {
            if (!keys?.length) {
                return 0;
            }
            return await this.client.del(keys);
        }
        catch (error) {
            console.log(`Fail to set this redis query :: ${error}`);
        }
        return;
    }
    ;
    async keys(prefix) {
        try {
            return await this.client.keys(`${prefix}*`);
        }
        catch (error) {
            console.log(`Fail to set this redis query :: ${error}`);
        }
        return [];
    }
    ;
    async incr(key) {
        try {
            return await this.client.incr(key);
        }
        catch (error) {
            console.log(`Fail to set this redis query :: ${error}`);
        }
        return;
    }
    ;
    async update({ key, value, ttl }) {
        try {
            if (!await this.exists(key)) {
                return 0;
            }
            return this.set({ key, value, ttl });
        }
        catch (error) {
            console.log(`Fail to set this redis query :: ${error}`);
        }
        return;
    }
    ;
    async get(key) {
        try {
            const value = await this.client.get(key);
            try {
                return JSON.parse(value);
            }
            catch (error) {
                return value;
            }
        }
        catch (error) {
            console.log(`Fail to set this redis query :: ${error}`);
            return;
        }
    }
    ;
    async mGet(keys) {
        try {
            return await this.client.mGet(keys);
        }
        catch (error) {
            console.log(`Fail in redis mGet operation ${error}`);
            return;
        }
    }
    ;
}
exports.RedisService = RedisService;
exports.redisService = new RedisService();
