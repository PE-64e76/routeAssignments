import { HydratedDocument, PopulateOptions, Types } from "mongoose";
import { CreatePostBodyDto, ReactPostParamsDto, ReactPostBodyDto, UpdatePostBodyDto, UpdatePostParamsDto, DeletePostParamsDto, DeletePostQueryDto, RestorePostParamsDto, UnreactPostParamsDto } from "./post.dto";
import { IPaginate, IPost, IUser } from "../../common/interfaces";
import { notificationService, NotificationService, redisService, RedisService, s3Service, S3Service } from "../../common/services";
import { PostRepository, UserRepository } from "../../DB/repository";
import { BadRequestException, ForbiddenException, NotFoundException } from "../../common/exceptions";
import { randomUUID } from "node:crypto";
import { getAvailability } from "../../common/utils/post";
import { PaginateDto } from "../../common/validation";
import { toObjectId } from "../../common/utils/objectId";
import { realtimeGateway, RealtimeGateway } from "../realtime";

export class PostService {
    private populate: PopulateOptions[] = [
        { path: "reactions.user" },
        { path: "createdBy" },
        { path: "tags" },
        { path: "comments", populate: [{ path: "replay", populate: [{ path: "replay" }] }] },
    ];
    private readonly redis: RedisService;
    private readonly userRepository: UserRepository;
    private readonly notification: NotificationService;
    private readonly postRepository: PostRepository;
    private readonly s3: S3Service;
    private realTime: RealtimeGateway;
    constructor() {
        this.realTime = realtimeGateway;
        this.userRepository = new UserRepository();
        this.postRepository = new PostRepository();
        this.redis = redisService;
        this.s3 = s3Service;
        this.notification = notificationService;
    }

    async postList({ page, search, size }: PaginateDto, user: HydratedDocument<IUser>): Promise<IPaginate<IPost>> {

        const posts = await this.postRepository.paginate({
            filter: {
                $or: getAvailability(user),
                ...(search?.length ? { content: { $regex: search, $options: "i" } } : {})
            },
            page,
            size,
            options: {
                populate: this.populate
            }
        });
        return posts;
    }

    async postFeed({ page, search, size }: PaginateDto, user: HydratedDocument<IUser>): Promise<IPaginate<IPost>> {

        const posts = await this.postRepository.paginate({
            filter: {
                createdBy: { $in: [user._id, ...(user.friends || [])] },
                ...(search?.length ? { content: { $regex: search, $options: "i" } } : {})
            },
            page,
            size,
            options: {
                populate: this.populate,
                sort: { createdAt: -1 }
            }
        });
        return posts;
    }

    async profilePosts(profileUserId: string, { page, search, size }: PaginateDto, user: HydratedDocument<IUser>): Promise<IPaginate<IPost>> {

        const posts = await this.postRepository.paginate({
            filter: {
                createdBy: profileUserId,
                $or: getAvailability(user),
                ...(search?.length ? { content: { $regex: search, $options: "i" } } : {})
            },
            page,
            size,
            options: {
                populate: this.populate,
                sort: { createdAt: -1 }
            }
        });
        return posts;
    }


    async createPost({ availability, content, files, tags }: CreatePostBodyDto, user: HydratedDocument<IUser>): Promise<IPost> {
        const mentions: Types.ObjectId[] = [];
        const FCM_Tokens: string[] = [];
        if (tags?.length) {
            const mentionedAccounts = await this.userRepository.find({
                filter: {
                    _id: { $in: tags }
                }
            });
            if (mentionedAccounts.length != tags.length) {
                throw new NotFoundException("Fail to find some or all mentioned accounts");
            }
            for (const tag of tags) {
                mentions.push(Types.ObjectId.createFromHexString(tag));
                (await this.redis.getFCMs(tag) || []).map(token => FCM_Tokens.push(token));
            }
        }

        const folderId = randomUUID();
        let attachments: string[] = [];
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files as Express.Multer.File[],
                path: `Post/${folderId}`
            });
        }
        const post = await this.postRepository.createOne({
            data: {
                createdBy: user._id,
                content: content as string,
                attachments,
                folderId,
                availability,
                tags: mentions,
            }
        });

        if (!post) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map(ele => { return { Key: ele }; })
                });
            }
            throw new BadRequestException("Fail");
        }

        if (FCM_Tokens.length) {
            await this.notification.sendNotifications({
                tokens: FCM_Tokens, data: {
                    title: "Post mention",
                    body: JSON.stringify({
                        message: `${user.username} mentioned you in his post`,
                        postId: post._id
                    })
                }
            });
        }

        return post.toJSON();
    }

    async updatePost({ postId }: UpdatePostParamsDto, { availability, content, files = [], tags = [], removeFiles = [], removeTags = [] }: UpdatePostBodyDto, user: HydratedDocument<IUser>): Promise<IPost> {

        const post = await this.postRepository.findOne({
            filter: { _id: postId, createdBy: user._id }
        });
        if (!post) {
            throw new NotFoundException("Fail to find matching post");
        }

        if (!post.content && !content && !files?.length && post.attachments?.length == removeFiles.length) {
            throw new BadRequestException("We cannot leave empty post");
        }

        const mentions: Types.ObjectId[] = [];
        const FCM_Tokens: string[] = [];
        if (tags?.length) {
            const mentionedAccounts = await this.userRepository.find({
                filter: {
                    _id: { $in: tags }
                }
            });
            if (mentionedAccounts.length != tags.length) {
                throw new NotFoundException("Fail to find some or all mentioned accounts");
            }
            for (const tag of tags) {
                mentions.push(toObjectId(tag));
                (await this.redis.getFCMs(tag) || []).map(token => FCM_Tokens.push(token));
            }
        }

        const folderId = post.folderId;
        let attachments: string[] = [];
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files as Express.Multer.File[],
                path: `Post/${folderId}`
            });
        }
        const updatePost = await this.postRepository.findOneAndUpdate({
            filter: {
                _id: postId,
                createdBy: user._id
            },
            update: [
                {
                    $set: {
                        content: content || post.content,
                        availability: Number(availability || post.availability),
                        updatedBy: user._id,
                        attachments: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        "$attachments",
                                        removeFiles
                                    ]
                                },
                                attachments
                            ]
                        },
                        tags: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        "$tags",
                                        removeTags.map(ele => { return toObjectId(ele); })
                                    ]
                                },
                                mentions
                            ]
                        },
                    }
                }
            ]
        });

        if (!updatePost) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map(ele => { return { Key: ele }; })
                });
            }
            throw new BadRequestException("Fail");
        }

        if (removeFiles.length) {
            await this.s3.deleteAssets({
                Keys: removeFiles.map(ele => { return { Key: ele }; })
            });
        }

        if (FCM_Tokens.length) {
            await this.notification.sendNotifications({
                tokens: FCM_Tokens, data: {
                    title: "Post mention",
                    body: JSON.stringify({
                        message: `${user.username} mentioned you in his post`,
                        postId: post._id
                    })
                }
            });
        }

        return updatePost.toJSON();
    }

    async reactPost({ postId }: ReactPostParamsDto, { react }: ReactPostBodyDto, user: HydratedDocument<IUser>): Promise<IPost> {
        const post = await this.postRepository.findOneAndUpdate({
            filter: {
                _id: postId,
                $or: getAvailability(user),
            },
            update: [
                {
                    $set: {
                        reactions: {
                            $concatArrays: [
                                {
                                    $filter: {
                                        input: { $ifNull: ["$reactions", []] },
                                        cond: { $ne: ["$$this.user", user._id] }
                                    }
                                },
                                [{ user: user._id, type: react }]
                            ]
                        }
                    }
                }
            ],
            populate: this.populate
        });

        if (!post) {
            throw new NotFoundException("Fail to find matching post");
        }
        const owner = post.createdBy as HydratedDocument<IUser>;
        const socketIds = await this.redis.getSockets(owner._id);
        if (socketIds.length & Number(react) || 0 > 0) {
            this.realTime.getIo().to(socketIds).emit("likePost", { postId, userId: user._id, react });
        }
        return post.toJSON();
    }

    async unreactPost({ postId }: UnreactPostParamsDto, user: HydratedDocument<IUser>): Promise<IPost> {
        const post = await this.postRepository.findOneAndUpdate({
            filter: {
                _id: postId,
                $or: getAvailability(user),
            },
            update: {
                $pull: { reactions: { user: user._id } }
            },
            populate: this.populate
        });
        if (!post) {
            throw new NotFoundException("Fail to find matching post");
        }
        return post.toJSON();
    }

    async deletePost({ postId }: DeletePostParamsDto, { force }: DeletePostQueryDto, user: HydratedDocument<IUser>): Promise<{ deletedCount: number; }> {

        const post = await this.postRepository.findOne({
            filter: { _id: postId }
        });
        if (!post) {
            throw new NotFoundException("Fail to find matching post");
        }
        if (post.createdBy.toString() != user._id.toString()) {
            throw new ForbiddenException("You are not allowed to delete this post");
        }

        const result = await this.postRepository.deleteOne({
            filter: { _id: postId },
            force: Boolean(force)
        });
        if (!result.deletedCount) {
            throw new BadRequestException("Fail to delete post");
        }

        if (force) {
            await this.s3.deleteFolderByPrefix({ prefix: `Post/${post.folderId}` });
        }

        return result;
    }

    async restorePost({ postId }: RestorePostParamsDto, user: HydratedDocument<IUser>): Promise<IPost> {

        const post = await this.postRepository.findOne({
            filter: { _id: postId, createdBy: user._id, paranoid: false, deletedAt: { $exists: true } }
        });
        if (!post) {
            throw new NotFoundException("Fail to find matching deleted post to restore");
        }

        await this.postRepository.restoreOne({
            filter: { _id: postId, createdBy: user._id }
        });

        const restored = await this.postRepository.findOne({
            filter: { _id: postId },
            options: { populate: this.populate }
        });
        if (!restored) {
            throw new NotFoundException("Fail to find matching post");
        }
        return restored.toJSON();
    }
}

export const postService = new PostService();