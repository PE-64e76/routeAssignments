import { createClient, RedisClientType } from "redis";
import { REDIS_URI } from "../../config/config.service";
import { EmailEnum } from "../enum";
import { Types } from "mongoose";

type BaseKeyType = { email: string, subject: EmailEnum; };

export class RedisService {
    private client: RedisClientType;
    constructor() {
        this.client = createClient({
            url: REDIS_URI
        });
        this.handleEvents();
    }

    private handleEvents() {
        this.client.on("error", (error) => console.log(`Fail connecting to redis 🙄`));
        this.client.on("connect", () => console.log(`Redis connected successfully ✅`));
        this.client.on("ready", () => console.log(`Redis is working 🥳`));
    }

    public async connect() {
        await this.client.connect();
    }


    otpKey({ email, subject = EmailEnum.ConfirmEmail }: BaseKeyType):string {
        return `OTP::User::${email}::${subject}`;
    };

    maxTrialOtpKey({ email, subject = EmailEnum.ConfirmEmail }: BaseKeyType):string {
        return `${this.otpKey({ email, subject })}::MaxTrial`;
    };

    blockOtpKey({ email, subject = EmailEnum.ConfirmEmail }: BaseKeyType):string {
        return `${this.otpKey({ email, subject })}::Block`;
    };

    baseRevokeTokenKey(userId: Types.ObjectId | string):string {
        return `RevokeToken::User::${userId.toString()}`;
    };

    revokeTokenKey({ userId, jti }: { userId: Types.ObjectId | string, jti: string; }):string {
        return `${this.baseRevokeTokenKey(userId)}::${jti}`;
    };


    public async set({ key, value, ttl = undefined }: { key: string, value: any, ttl?: number | undefined; }): Promise<any> {
        try {
            value = typeof value === "string" ? value : JSON.stringify(value);
            return ttl ? await this.client.set(key, value, { EX: ttl }) : await this.client.set(key, value);

        } catch (error) {
            console.log(`Fail to set this redis query :: ${error}`);
        }
    };

    public async exists(key: string) {
        try {
            return await this.client.exists(key);
        } catch (error) {
            console.log(`Fail to set this redis query :: ${error}`);
            return;
        }
    };

    public async ttl(key: string): Promise<number> {
        try {
            return await this.client.ttl(key);
        } catch (error) {
            console.log(`Fail to set this redis query :: ${error}`);
            return -2;
        }
    };

    public async expire({ key, ttl }: { key: string, ttl: number; }) {
        try {
            return await this.client.expire(key, ttl);
        } catch (error) {
            console.log(`Fail to set this redis query :: ${error}`);
        }
        return;
    };

    public async deleteKey(keys: string | string[]) {
        try {
            if (!keys?.length) {
                return 0;
            }
            return await this.client.del(keys);
        } catch (error) {
            console.log(`Fail to set this redis query :: ${error}`);
        }
        return;
    };

    public async keys(prefix: string):Promise<string[]> {
        try {
            return await this.client.keys(`${prefix}*`);
        } catch (error) {
            console.log(`Fail to set this redis query :: ${error}`);
        }
        return [];
    };

    public async incr(key: string) {
        try {
            return await this.client.incr(key);
        } catch (error) {
            console.log(`Fail to set this redis query :: ${error}`);
        }
        return;
    };

    async update({ key, value, ttl }: { key: string, value: any, ttl?: number | undefined; }) {
        try {
            if (!await this.exists(key)) {
                return 0;
            }
            return this.set({ key, value, ttl });
        } catch (error) {
            console.log(`Fail to set this redis query :: ${error}`);
        }
        return;
    };

    async get(key: string) {
        try {
            const value = await this.client.get(key);
            try {
                return JSON.parse(value as string);

            } catch (error) {
                return value;
            }

        } catch (error) {
            console.log(`Fail to set this redis query :: ${error}`);
            return;
        }
    };

    async mGet(keys: string[]) {
        try {
            return await this.client.mGet(keys);
        } catch (error) {
            console.log(`Fail in redis mGet operation ${error}`);
            return;
        }
    };
}

export const redisService = new RedisService();