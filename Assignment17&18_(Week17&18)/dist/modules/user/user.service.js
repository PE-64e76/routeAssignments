"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const security_1 = require("../../common/utils/security");
const config_service_1 = require("../../config/config.service");
const exceptions_1 = require("../../common/exceptions");
const services_1 = require("../../common/services");
const enum_1 = require("../../common/enum");
class UserService {
    tokenService;
    redis;
    constructor() {
        this.tokenService = new services_1.TokenService();
        this.redis = services_1.redisService;
    }
    async profile(user) {
        user.phone = await (0, security_1.generateDecryption)(user.phone);
        return user;
    }
    async rotateToken(user, { sub, iat, expiresIn, jti }, issuer) {
        if (Date.now() + 30000 < (iat + config_service_1.ACCESS_TOKEN_EXPIRES_IN) * 1000) {
            throw new exceptions_1.ConflictException("Current access session still valid");
        }
        await this.tokenService.createRevokeToken({ userId: sub, jti, ttl: config_service_1.REFRESH_TOKEN_EXPIRES_IN });
        return this.tokenService.createLoginCredentials(user, issuer);
    }
    ;
    async logout(flag, user, { sub, iat, jti }) {
        let status = 200;
        switch (flag) {
            case enum_1.logoutEnum.All:
                user.changeCredentialsTime = new Date();
                await user.save();
                await this.redis.deleteKey(await this.redis.keys(this.redis.baseRevokeTokenKey(sub)));
                break;
            default:
                await this.tokenService.createRevokeToken({ userId: sub, jti, ttl: config_service_1.REFRESH_TOKEN_EXPIRES_IN });
                status = 201;
                break;
        }
        return status;
    }
    ;
    async updatePassword({ oldPassword, password }, user, issuer) {
        if (!await (0, security_1.compareHash)({ plaintext: oldPassword, cipherText: user.password })) {
            throw new exceptions_1.ConflictException("Invalid old password");
        }
        user.password = await (0, security_1.generateHash)({ plaintext: password });
        user.changeCredentialsTime = new Date();
        await user.save();
        const tokenKeys = await this.redis.keys(this.redis.baseRevokeTokenKey(user._id));
        await this.redis.deleteKey(tokenKeys);
        return await this.tokenService.createLoginCredentials(user, issuer);
    }
}
exports.default = new UserService();
