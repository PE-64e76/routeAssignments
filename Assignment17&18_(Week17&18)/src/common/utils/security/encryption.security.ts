import crypto from "node:crypto";
import { ENC_SECRET_KEY, IV_LENGTH } from "../../../config/config.service";
import { BadRequestException } from "../../exceptions";

export const generateEncryption = async (plaintext: string): Promise<string> => {
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipherIV = crypto.createCipheriv('aes-256-cbc', ENC_SECRET_KEY, iv);
    let cipherText = cipherIV.update(plaintext, "utf-8", 'hex');
    cipherText += cipherIV.final("hex");
    console.log({ iv, ivT: iv.toString("hex"), cipherIV, cipherText });
    return `${iv.toString('hex')}:${cipherText}`;
};

export const generateDecryption = async (cipherText: string):Promise<string> => {
    const [iv, encryptedData] = (cipherText.split(":") || []) as string[];
    if (!iv || !encryptedData) {
        throw new BadRequestException("Fail to encrypt");
    }
    const ivLikeBinary = Buffer.from(iv, "hex");
    let decipherIv = crypto.createDecipheriv('aes-256-cbc', ENC_SECRET_KEY, ivLikeBinary);
    let plaintext = decipherIv.update(encryptedData, "hex", "utf-8");
    plaintext = decipherIv.final('utf-8');
    console.log({ iv, encryptedData, ivLikeBinary, decipherIv, plaintext });
    return plaintext;

};