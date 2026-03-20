import { hash , compare } from "bcrypt";
import * as argon2 from "argon2"
import { SALT_ROUND } from "../../../../config/config.service.js";
import { hashEnum } from "../../enums/index.js"

export const generateHash = async (plaintext, salt=SALT_ROUND, algo= hashEnum.Bcrypt) =>{
    let hashResult = ''
    switch (algo) {
        case hashEnum.Bcrypt:
            hashResult = await hash(plaintext, salt) 
            break;
            
        case hashEnum.Argon:
            hashResult = await argon2.hash(plaintext) 
            break;
        default:
            hashResult = await hash(plaintext, salt)
            break;
    }
    return hashResult
}

export const compareHash = async (plaintext, cipherText, algo= hashEnum.Bcrypt) =>{
    let match = false
    switch (algo) {
        case hashEnum.Bcrypt:
            match = await compare(plaintext, cipherText) 
            break;
            
        case hashEnum.Argon:
            match = await argon2.verify(cipherText, plaintext) 
            break;
        default:
            match = await compare(plaintext, cipherText)
            break;
    }
    return match 
}

