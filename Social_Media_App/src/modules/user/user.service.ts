import { HydratedDocument } from "mongoose";
import { IChat, IUser, IUserDashboard } from "../../common/interfaces";
import { compareHash, generateHash } from "../../common/utils/security";
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "../../config/config.service";
import { ConflictException, NotFoundException } from "../../common/exceptions";
import { redisService, RedisService, s3Service, S3Service, TokenService } from "../../common/services";
import { ChatEnum, logoutEnum, StorageApproachEnum, UploadApproachEnum } from "../../common/enum";
import { PostRepository, CommentRepository, ChatRepository } from "../../DB/repository";
import { UserRepository } from "../../DB/repository/user.repository";
import { UpdateProfileBodyDto } from "./user.dto";



export class UserService {
    private readonly redis: RedisService;
    private readonly tokenService: TokenService;
    private readonly userRepository: UserRepository;
    private readonly postRepository: PostRepository;
    private readonly commentRepository: CommentRepository;
    private readonly s3: S3Service;
    private chatRepository: ChatRepository;

    constructor() {
        this.redis = redisService;
        this.tokenService = new TokenService();
        this.userRepository = new UserRepository();
        this.postRepository = new PostRepository();
        this.commentRepository = new CommentRepository();
        this.s3 = s3Service;
        this.chatRepository = new ChatRepository();
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
        // const oldPic = user.profilePicture;
        const { url } = await this.s3.createPreSignedUploadLink({
            path: `Users/${user._id.toString()}/Profile`,
            ContentType,
            Originalname
        });
        // user.profilePicture = Key as string;
        // await user.save();
        // if (oldPic) {
        //     await this.s3.deleteAsset({ Key: oldPic });
        // }

        return { user, url };
    }


    async profile(user: HydratedDocument<IUser>): Promise<{ user: IUser, groups: HydratedDocument<IChat>[] }> {
        await user.populate([{ path: "friends" }]);
        const groups = await this.chatRepository.find({ filter: {type:ChatEnum.ovm, participants: { $in: [user._id] } } });
        return { user: user.toJSON(), groups };
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

    async updateProfile({ username, phone, DOB, gender }: UpdateProfileBodyDto, user: HydratedDocument<IUser>): Promise<IUser> {
        if (username) user.username = username;
        if (phone) user.phone = phone;
        if (DOB) user.DOB = DOB;
        if (gender != null) user.gender = gender;
        await user.save();
        return user.toJSON();
    }

    async deleteProfile(user: HydratedDocument<IUser>, force: boolean = false) {
        const account = await this.userRepository.deleteOne({ filter: { _id: user._id }, force });
        if (!account.deletedCount) {
            throw new NotFoundException("Invalid Account");
        }
        if (force) {
            await this.s3.deleteFolderByPrefix({ prefix: `Users/${user._id.toString()}` });
        }
        return account;
    };

    async restoreProfile(userId: string): Promise<IUser> {
        const deletedUser = await this.userRepository.findOne({
            filter: { _id: userId, paranoid: false, deletedAt: { $exists: true } }
        });
        if (!deletedUser) {
            throw new NotFoundException("Fail to find matching deleted account to restore");
        }

        await this.userRepository.restoreOne({
            filter: { _id: userId }
        });
        const user = await this.userRepository.findOne({
            filter: { _id: userId }
        });
        if (!user) {
            throw new NotFoundException("Fail to find matching account to restore");
        }
        return user.toJSON();
    }

    async dashboard(user: HydratedDocument<IUser>): Promise<IUserDashboard> {

        const postsCount = await this.postRepository.count({
            filter: { createdBy: user._id }
        });
        const commentsCount = await this.commentRepository.count({
            filter: { createdBy: user._id }
        });
        const friendsCount = user.friends?.length || 0;

        const reactionsAggregation = await this.postRepository.aggregate<{ totalReactions: number; }>({
            pipeline: [
                { $match: { createdBy: user._id } },
                { $project: { reactionsCount: { $size: { $ifNull: ["$reactions", []] } } } },
                { $group: { _id: null, totalReactions: { $sum: "$reactionsCount" } } }
            ]
        });
        const reactionsReceived = reactionsAggregation[0]?.totalReactions || 0;

        return { postsCount, commentsCount, reactionsReceived, friendsCount };
    }

}

export default new UserService();