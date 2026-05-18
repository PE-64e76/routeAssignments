import { resolve } from "path";
import { config } from "dotenv";

export const NODE_ENV = process.env.NODE_ENV;

const envPath = {
  development: ".env.development",
  production: ".env.production",
};
console.log({ en: envPath[NODE_ENV] });

config({ path: resolve(`./config/${envPath[NODE_ENV]}`) });

export const port = process.env.port ?? 7000;

export const DB_URI = process.env.DB_URI;
export const ENC_BYTE = process.env.ENC_BYTE;

export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? '10')
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
export const EMAIL_SERVICE = process.env.EMAIL_SERVICE ?? 'gmail';
