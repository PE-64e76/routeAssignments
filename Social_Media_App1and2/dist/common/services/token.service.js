"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_service_1 = require("../../config/config.service");
const enum_1 = require("../enum");
const exceptions_1 = require("../exceptions");
const redis_service_1 = require("./redis.service");
const user_repository_1 = require("../../DB/repository/user.repository");
const node_crypto_1 = require("node:crypto");
class TokenService {
    userRepository;
    redis;
    constructor() {
        this.userRepository = new user_repository_1.UserRepository();
        this.redis = redis_service_1.redisService;
    }
    async sign({ payload, secret = config_service_1.USER_ACCESS_TOKEN_SECRET_KEY, options }) {
        return jsonwebtoken_1.default.sign(payload, secret, options);
    }
    async verify({ token, secret = config_service_1.USER_ACCESS_TOKEN_SECRET_KEY, }) {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    async detectSignatureLevel(level) {
        let signatures;
        switch (level) {
            case enum_1.RoleEnum.ADMIN:
                signatures = { accessSignature: config_service_1.SYSTEM_ACCESS_TOKEN_SECRET_KEY, refreshSignature: config_service_1.SYSTEM_REFRESH_TOKEN_SECRET_KEY };
                break;
            default:
                signatures = { accessSignature: config_service_1.USER_ACCESS_TOKEN_SECRET_KEY, refreshSignature: config_service_1.USER_REFRESH_TOKEN_SECRET_KEY };
                break;
        }
        return signatures;
    }
    ;
    async getTokenSignature({ tokenType = enum_1.TokenTypeEnum.ACCESS, level }) {
        const { accessSignature, refreshSignature } = await this.detectSignatureLevel(level);
        let signature = undefined;
        switch (tokenType) {
            case enum_1.TokenTypeEnum.REFRESH:
                signature = refreshSignature;
                break;
            default:
                signature = accessSignature;
                break;
        }
        return signature;
    }
    ;
    async decodeToken({ token, tokenType = enum_1.TokenTypeEnum.ACCESS }) {
        const decoded = jsonwebtoken_1.default.decode(token);
        console.log({ decoded });
        if (!decoded?.aud?.length) {
            throw new exceptions_1.BadRequestException("Missing token audience");
        }
        const [tokenApproach, level] = decoded.aud || [];
        const tokenApproachEnum = typeof tokenApproach === 'number'
            ? tokenApproach
            : typeof tokenApproach === 'string' && /^[0-9]+$/.test(tokenApproach)
                ? Number(tokenApproach)
                : enum_1.TokenTypeEnum[tokenApproach];
        console.log({ tokenApproach, tokenApproachEnum });
        if (tokenApproachEnum === undefined) {
            throw new exceptions_1.ConflictException(`Unexpected token mechanism received ${tokenApproach}`);
        }
        if (tokenType !== tokenApproachEnum) {
            throw new exceptions_1.ConflictException(`Unexpected token mechanism we expected ${enum_1.TokenTypeEnum[tokenType]} while you have used ${enum_1.TokenTypeEnum[tokenApproachEnum] ?? tokenApproach}`);
        }
        if (decoded.jti && await redis_service_1.redisService.get(redis_service_1.redisService.revokeTokenKey({
            userId: decoded.sub,
            jti: decoded.jti
        }))) {
            throw new exceptions_1.UnauthorizedException("Invalid login session");
        }
        const secret = await this.getTokenSignature({
            tokenType: tokenApproachEnum,
            level: level
        });
        console.log({ secret });
        const verifiedData = jsonwebtoken_1.default.verify(token, secret);
        console.log({ verifiedData });
        const user = await this.userRepository.findOne({ filter: { _id: verifiedData.sub } });
        if (!user) {
            throw new exceptions_1.NotFoundException("Not register account");
        }
        if (user.changeCredentialsTime && user.changeCredentialsTime?.getTime() >= decoded.iat * 1000) {
            throw new exceptions_1.UnauthorizedException("Invalid login session");
        }
        return { user, decoded };
    }
    ;
    async createLoginCredentials(user, issuer) {
        const { accessSignature, refreshSignature } = await this.detectSignatureLevel(user.role);
        const jwtid = (0, node_crypto_1.randomUUID)();
        const access_token = await this.sign({
            payload: { sub: user._id, extra: 250 },
            secret: accessSignature,
            options: {
                issuer,
                audience: [enum_1.TokenTypeEnum.ACCESS, user.role],
                expiresIn: config_service_1.ACCESS_TOKEN_EXPIRES_IN,
                jwtid
            }
        });
        const refresh_token = await this.sign({
            payload: { sub: user._id },
            secret: refreshSignature,
            options: {
                issuer,
                audience: [enum_1.TokenTypeEnum.REFRESH, user.role],
                expiresIn: config_service_1.REFRESH_TOKEN_EXPIRES_IN,
                jwtid
            }
        });
        return { access_token, refresh_token };
    }
    ;
    async createRevokeToken({ userId, jti, ttl }) {
        await this.redis.set({
            key: this.redis.revokeTokenKey({ userId, jti }),
            value: jti,
            ttl
        });
    }
    ;
}
exports.TokenService = TokenService;
