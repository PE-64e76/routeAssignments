import { HydratedDocument, Types } from "mongoose";
import { IComment, IPost, IUser } from "../../common/interfaces";
import { notificationService, NotificationService, redisService, RedisService, s3Service, S3Service } from "../../common/services";
import { CommentRepository, PostRepository, UserRepository } from "../../DB/repository";
import { BadRequestException, NotFoundException } from "../../common/exceptions";
import { CreateCommentBodyDto, CreateCommentParamsDto, CreateReplayOnCommentParamsDto } from "./comment.dto";
import { getAvailability } from "../../common/utils/post";


export class CommentService {
    private readonly redis: RedisService;
    private readonly userRepository: UserRepository;
    private readonly commentRepository: CommentRepository;
    private readonly notification: NotificationService;
    private readonly postRepository: PostRepository;
    private readonly s3: S3Service;
    constructor() {
        this.userRepository = new UserRepository();
        this.postRepository = new PostRepository();
        this.commentRepository = new CommentRepository();
        this.redis = redisService;
        this.s3 = s3Service;
        this.notification = notificationService;
    }


    async createComment({ postId }: CreateCommentParamsDto, { content, files, tags }: CreateCommentBodyDto, user: HydratedDocument<IUser>): Promise<IComment> {

        const post = await this.postRepository.findOne({
            filter: {
                _id: postId,
                $or: getAvailability(user)
            }
        });
        if (!post) {
            throw new NotFoundException("Fail to find matching post");
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
                mentions.push(Types.ObjectId.createFromHexString(tag));
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
        const comment = await this.commentRepository.createOne({
            data: {
                createdBy: user._id,
                content: content as string,
                attachments,
                postId: post._id,
                tags: mentions,
            }
        });

        if (!comment) {
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
                        message: `${user.username} mentioned you in his comment`,
                        postId: post._id,
                        commentId: comment._id,
                    })
                }
            });
        }

        return comment.toJSON();
    }

    async replayOnComment({ postId, commentId }: CreateReplayOnCommentParamsDto, { content, files, tags }: CreateCommentBodyDto, user: HydratedDocument<IUser>): Promise<IComment> {

        const comment = await this.commentRepository.findOne({
            filter: {
                _id: commentId,
                postId: postId,
            },
            options: {
                populate: [{
                    path: "postId",
                    match: {
                        $or: getAvailability(user)
                    }
                }]
            }
        });
        if (!comment?.postId) {
            throw new NotFoundException("Fail to find matching comment");
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
                mentions.push(Types.ObjectId.createFromHexString(tag));
                (await this.redis.getFCMs(tag) || []).map(token => FCM_Tokens.push(token));
            }
        }

        const post = comment.postId as HydratedDocument<IPost>
        const folderId = post.folderId;
        let attachments: string[] = [];
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files as Express.Multer.File[],
                path: `Post/${folderId}`
            });
        }
        const replay = await this.commentRepository.createOne({
            data: {
                createdBy: user._id,
                content: content as string,
                attachments,
                postId: post._id,
                commentId: comment._id,
                tags: mentions,
            }
        });

        if (!replay) {
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
                        message: `${user.username} mentioned you in his comment`,
                        postId: post._id,
                        commentId: comment._id,
                        replayId: replay._id,
                    })
                }
            });
        }

        return replay.toJSON();
    }

}

export const commentService = new CommentService();