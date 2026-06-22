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

export const REDIS_URI = process.env.REDIS_URI as string;

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


export const AWS_REGION = process.env.AWS_REGION as string;
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME as string;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID as string;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY as string;
export const AWS_EXPIRES_IN = parseInt(process.env.AWS_EXPIRES_IN as string || "120")

// Optional: when set, Firebase Admin SDK credentials are read from these env vars
// instead of the local service-account JSON file in src/config. This lets production
// deployments configure Firebase without checking a credentials file into the repo.
// If any of these are missing, the notification service falls back to the local file.
export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
export const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
export const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
export const FIREBASE_SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;