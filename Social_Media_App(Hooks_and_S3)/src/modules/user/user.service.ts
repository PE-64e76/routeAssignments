import { HydratedDocument } from "mongoose";
import { IUser } from "../../common/interfaces";
import { generateDecryption, compareHash, generateHash } from "../../common/utils/security";
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "../../config/config.service";
import { ConflictException } from "../../common/exceptions";
import { redisService, RedisService, s3Service, S3Service, TokenService } from "../../common/services";
import { logoutEnum, StorageApproachEnum, UploadApproachEnum } from "../../common/enum";



class UserService {
    private readonly tokenService: TokenService;
    private readonly redis: RedisService;
    private readonly s3: S3Service;

    constructor() {
        this.tokenService = new TokenService();
        this.redis = redisService;
        this.s3 = s3Service;
    }


    async profileCoverImages(files: Express.Multer.File[], user: HydratedDocument<IUser>) {
        const oldUrls = user.profileCoverPictures;
        const urls = await this.s3.uploadAssets({
            files,
            path: `Users/${user._id.toString()}/Profile/Cover`,
            storageApproach: StorageApproachEnum.DISK,
            uploadApproach: UploadApproachEnum.SMALL
        });
        user.profileCoverPictures = urls;
        await user.save();

        if (oldUrls?.length) {
            await this.s3.deleteAssets({
                Keys: oldUrls.map(ele => { return { Key: ele }; })
            });
        }
        return user.toJSON();
    }


    async profileImage({ ContentType, Originalname }: { ContentType: string, Originalname: string; }, user: HydratedDocument<IUser>): Promise<{ user: IUser, url: string; }> {
        const oldPic = user.profilePicture;
        const { url, Key } = await this.s3.createPreSignedUploadLink({
            path: `Users/${user._id.toString()}/Profile`,
            ContentType,
            Originalname
        });
        user.profilePicture = Key as string;
        await user.save();

        if (oldPic) {
            await this.s3.deleteAsset({ Key: oldPic });
        }

        return { user, url };
    }


    async profile(user: HydratedDocument<IUser>) {
        user.phone = await generateDecryption(user.phone);
        return user;
    }



    async rotateToken(user: HydratedDocument<IUser>, { sub, iat, expiresIn, jti }: { sub: string, iat: number, expiresIn: number, jti: string; }, issuer: string) {
        if (Date.now() + 30000 < (iat + ACCESS_TOKEN_EXPIRES_IN) * 1000) {
            throw new ConflictException("Current access session still valid");
        }
        await this.tokenService.createRevokeToken({ userId: sub, jti, ttl: REFRESH_TOKEN_EXPIRES_IN });
        return this.tokenService.createLoginCredentials(user, issuer);
    };

    async logout(flag: logoutEnum, user: HydratedDocument<IUser>, { sub, iat, jti }: { sub: string, iat: number, jti: string; }) {
        let status = 200;
        switch (flag) {
            case logoutEnum.All:
                user.changeCredentialsTime = new Date();
                await user.save();
                await this.redis.deleteKey(await this.redis.keys(this.redis.baseRevokeTokenKey(sub)));
                break;
            default:
                await this.tokenService.createRevokeToken({ userId: sub, jti, ttl: REFRESH_TOKEN_EXPIRES_IN });
                status = 201;
                break;
        }
        return status;
    };

    async updatePassword(
        { oldPassword, password }: { oldPassword: string; password: string; },
        user: HydratedDocument<IUser>,
        issuer: string
    ) {
        if (!await compareHash({ plaintext: oldPassword, cipherText: user.password })) {
            throw new ConflictException("Invalid old password");
        }

        // for (const hash of user.oldPasswords || []) {
        //   if (await compareHash({ plaintext: password, cipherText: hash })) {
        //     throw new ConflictException("This password is used before")
        //   }
        // }
        // user.oldPasswords.push(user.password)

        user.password = await generateHash({ plaintext: password });
        user.changeCredentialsTime = new Date();
        await user.save();
        const tokenKeys = await this.redis.keys(this.redis.baseRevokeTokenKey(user._id));
        await this.redis.deleteKey(tokenKeys);
        return await this.tokenService.createLoginCredentials(user, issuer);
    }
}

export default new UserService();