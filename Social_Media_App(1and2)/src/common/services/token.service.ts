import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, SYSTEM_ACCESS_TOKEN_SECRET_KEY, SYSTEM_REFRESH_TOKEN_SECRET_KEY, USER_ACCESS_TOKEN_SECRET_KEY, USER_REFRESH_TOKEN_SECRET_KEY } from '../../config/config.service';
import { RoleEnum, TokenTypeEnum } from '../enum';
import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from '../exceptions';
import { RedisService, redisService } from './redis.service';
import { UserRepository } from '../../DB/repository/user.repository';
import { randomUUID } from 'node:crypto';
import { HydratedDocument, Types } from 'mongoose';
import { IUser } from '../interfaces';

export class TokenService {
    private userRepository: UserRepository;
    private readonly redis: RedisService;
    constructor() {
        this.userRepository = new UserRepository();
        this.redis = redisService;
    }

    async sign({
        payload,
        secret = USER_ACCESS_TOKEN_SECRET_KEY,
        options
    }: {
        payload: object,
        secret?: string,
        options?: SignOptions;
    }): Promise<string> {
        return jwt.sign(payload, secret, options);
    }

    async verify({
        token,
        secret = USER_ACCESS_TOKEN_SECRET_KEY,
    }: {
        token: string,
        secret?: string,
    }): Promise<JwtPayload> {
        return jwt.verify(token, secret) as JwtPayload;
    }

    async detectSignatureLevel(level: RoleEnum): Promise<{ accessSignature: string, refreshSignature: string; }> {
        let signatures: { accessSignature: string, refreshSignature: string; };
        switch (level) {
            case RoleEnum.ADMIN:
                signatures = { accessSignature: SYSTEM_ACCESS_TOKEN_SECRET_KEY, refreshSignature: SYSTEM_REFRESH_TOKEN_SECRET_KEY };
                break;

            default:
                signatures = { accessSignature: USER_ACCESS_TOKEN_SECRET_KEY, refreshSignature: USER_REFRESH_TOKEN_SECRET_KEY };
                break;
        }
        return signatures;
    };

    async getTokenSignature({ tokenType = TokenTypeEnum.ACCESS, level }: { tokenType: TokenTypeEnum, level: RoleEnum; }): Promise<string> {
        const { accessSignature, refreshSignature } = await this.detectSignatureLevel(level);
        let signature = undefined;
        switch (tokenType) {
            case TokenTypeEnum.REFRESH:
                signature = refreshSignature;
                break;
            default:
                signature = accessSignature;
                break;
        }
        return signature;
    };

    async decodeToken({ token, tokenType = TokenTypeEnum.ACCESS }: { token: string, tokenType: TokenTypeEnum; }): Promise<{ user: HydratedDocument<IUser>, decoded: JwtPayload; }> {
        const decoded = jwt.decode(token) as JwtPayload;
        console.log({ decoded });
        if (!decoded?.aud?.length) {
            throw new BadRequestException("Missing token audience");
        }
        const [tokenApproach, level] = decoded.aud || [];
        const tokenApproachEnum = typeof tokenApproach === 'number'
            ? tokenApproach as TokenTypeEnum
            : typeof tokenApproach === 'string' && /^[0-9]+$/.test(tokenApproach)
                ? Number(tokenApproach) as TokenTypeEnum
                : TokenTypeEnum[tokenApproach as keyof typeof TokenTypeEnum] as TokenTypeEnum;
        console.log({ tokenApproach, tokenApproachEnum });
        if (tokenApproachEnum === undefined) {
            throw new ConflictException(`Unexpected token mechanism received ${tokenApproach}`);
        }
        if (tokenType !== tokenApproachEnum) {
            throw new ConflictException(`Unexpected token mechanism we expected ${TokenTypeEnum[tokenType]} while you have used ${TokenTypeEnum[tokenApproachEnum] ?? tokenApproach}`);
        }

        if (
            decoded.jti && await redisService.get(redisService.revokeTokenKey({
                userId: decoded.sub as string,
                jti: decoded.jti
            }))
        ) {
            throw new UnauthorizedException("Invalid login session");
        }
        const secret = await this.getTokenSignature({
            tokenType: tokenApproachEnum,
            level: level as unknown as RoleEnum
        });
        console.log({ secret });

        const verifiedData = jwt.verify(token, secret);
        console.log({ verifiedData });
        const user = await this.userRepository.findOne({ filter: { _id: verifiedData.sub } });
        if (!user) {
            throw new NotFoundException("Not register account");
        }
        if (user.changeCredentialsTime && user.changeCredentialsTime?.getTime() >= (decoded.iat as number) * 1000) {
            throw new UnauthorizedException("Invalid login session");
        }
        return { user, decoded };


    };

    async createLoginCredentials(user: HydratedDocument<IUser>, issuer: string): Promise<{ access_token: string, refresh_token: string; }> {
        const { accessSignature, refreshSignature } = await this.detectSignatureLevel(user.role);
        const jwtid = randomUUID();
        const access_token = await this.sign(
            {
                payload: { sub: user._id, extra: 250 },
                secret: accessSignature,
                options: {
                    issuer,
                    audience: [TokenTypeEnum.ACCESS as unknown as string, user.role as unknown as string],
                    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
                    jwtid
                }
            });
        const refresh_token = await this.sign({
            payload: { sub: user._id },
            secret: refreshSignature,
            options: {
                issuer,
                audience: [TokenTypeEnum.REFRESH as unknown as string, user.role as unknown as string],
                expiresIn: REFRESH_TOKEN_EXPIRES_IN,
                jwtid
            }
        });
        return { access_token, refresh_token };
    };

    async createRevokeToken({ userId, jti, ttl }: { userId: string | Types.ObjectId, jti: string, ttl: number; }) {
        await this.redis.set({
            key: this.redis.revokeTokenKey({ userId, jti }),
            value: jti,
            ttl
        });
    };

}