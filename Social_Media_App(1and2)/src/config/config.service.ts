import { config } from "dotenv";
import { resolve } from "node:path";

const env = process.env.NODE_ENV || "development";
config({ path: resolve(`.env.${env}`) });
config({ path: resolve(".env"), override: false });

export const PORT = Number(process.env.PORT || 3000);
export const DB_URI = process.env.DB_URI;

export const APPLICATION_NAME = process.env.APPLICATION_NAME as string;
export const APP_EMAIL_PASSWORD = process.env.APP_EMAIL_PASSWORD as string;
export const APP_EMAIL = process.env.APP_EMAIL as string;

export const TWITTER_LINK = process.env.TWITTER_LINK as string;
export const FACEBOOK_LINK = process.env.FACEBOOK_LINK as string;
export const INSTAGRAM_LINK = process.env.INSTAGRAM_LINK as string;

export const REDIS_URI = process.env.REDIS_URI;

export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? "10", 10);
export const IV_LENGTH = parseInt(process.env.IV_LENGTH ?? "16", 10);
export const ENC_SECRET_KEY = Buffer.from(process.env.ENC_SECRET_KEY || "");

export const USER_ACCESS_TOKEN_SECRET_KEY = process.env.USER_ACCESS_TOKEN_SECRET_KEY as string;
export const USER_REFRESH_TOKEN_SECRET_KEY = process.env.USER_REFRESH_TOKEN_SECRET_KEY as string;

export const SYSTEM_ACCESS_TOKEN_SECRET_KEY = process.env.SYSTEM_ACCESS_TOKEN_SECRET_KEY as string;
export const SYSTEM_REFRESH_TOKEN_SECRET_KEY = process.env.SYSTEM_REFRESH_TOKEN_SECRET_KEY as string;

export const REFRESH_TOKEN_EXPIRES_IN = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN || "86400", 10);
export const ACCESS_TOKEN_EXPIRES_IN = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN || "3600", 10);
export const ORIGINS = process.env.ORIGINS?.split(",") || [];
export const GOOGLE_IDS = (process.env.GOOGLE_IDS?.split(",") || []) as string[]; 