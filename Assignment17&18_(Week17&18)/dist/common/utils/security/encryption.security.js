"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDecryption = exports.generateEncryption = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const config_service_1 = require("../../../config/config.service");
const exceptions_1 = require("../../exceptions");
const generateEncryption = async (plaintext) => {
    const iv = node_crypto_1.default.randomBytes(config_service_1.IV_LENGTH);
    const cipherIV = node_crypto_1.default.createCipheriv('aes-256-cbc', config_service_1.ENC_SECRET_KEY, iv);
    let cipherText = cipherIV.update(plaintext, "utf-8", 'hex');
    cipherText += cipherIV.final("hex");
    console.log({ iv, ivT: iv.toString("hex"), cipherIV, cipherText });
    return `${iv.toString('hex')}:${cipherText}`;
};
exports.generateEncryption = generateEncryption;
const generateDecryption = async (cipherText) => {
    const [iv, encryptedData] = (cipherText.split(":") || []);
    if (!iv || !encryptedData) {
        throw new exceptions_1.BadRequestException("Fail to encrypt");
    }
    const ivLikeBinary = Buffer.from(iv, "hex");
    let decipherIv = node_crypto_1.default.createDecipheriv('aes-256-cbc', config_service_1.ENC_SECRET_KEY, ivLikeBinary);
    let plaintext = decipherIv.update(encryptedData, "hex", "utf-8");
    plaintext = decipherIv.final('utf-8');
    console.log({ iv, encryptedData, ivLikeBinary, decipherIv, plaintext });
    return plaintext;
};
exports.generateDecryption = generateDecryption;
