import { HydratedDocument, PopulateOptions, Types } from "mongoose";
import { IComment, IPaginate, IPost, IUser } from "../../common/interfaces";
import { notificationService, NotificationService, redisService, RedisService, s3Service, S3Service } from "../../common/services";
import { CommentRepository, PostRepository, UserRepository } from "../../DB/repository";
import { BadRequestException, ForbiddenException, NotFoundException } from "../../common/exceptions";
import { CreateCommentBodyDto, CreateCommentParamsDto, CreateReplayOnCommentParamsDto, CommentListParamsDto, CommentListQueryDto, GetCommentParamsDto, UpdateCommentParamsDto, UpdateCommentBodyDto, DeleteCommentParamsDto, DeleteCommentQueryDto, RestoreCommentParamsDto, ReactCommentParamsDto, ReactCommentBodyDto, UnreactCommentParamsDto } from "./comment.dto";
import { getAvailability } from "../../common/utils/post";
import { toObjectId } from "../../common/utils/objectId";


export class CommentService {
    private populate: PopulateOptions[] = [
        { path: "reactions.user" },
        { path: "createdBy" },
        { path: "tags" },
        { path: "replay", populate: [{ path: "replay" }] },
    ];
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

    async commentList({ postId }: CommentListParamsDto, { page, search, size }: CommentListQueryDto, user: HydratedDocument<IUser>): Promise<IPaginate<IComment>> {

        const post = await this.postRepository.findOne({
            filter: {
                _id: postId,
                $or: getAvailability(user)
            }
        });
        if (!post) {
            throw new NotFoundException("Fail to find matching post");
        }

        const comments = await this.commentRepository.paginate({
            filter: {
                postId: post._id,
                commentId: { $exists: false },
                ...(search?.length ? { content: { $regex: search, $options: "i" } } : {})
            },
            page,
            size,
            options: {
                populate: this.populate
            }
        });
        return comments;
    }

    async getComment({ postId, commentId }: GetCommentParamsDto, user: HydratedDocument<IUser>): Promise<IComment> {

        const post = await this.postRepository.findOne({
            filter: {
                _id: postId,
                $or: getAvailability(user)
            }
        });
        if (!post) {
            throw new NotFoundException("Fail to find matching post");
        }

        const comment = await this.commentRepository.findOne({
            filter: { _id: commentId, postId: post._id },
            options: { populate: this.populate }
        });
        if (!comment) {
            throw new NotFoundException("Fail to find matching comment");
        }
        return comment.toJSON();
    }

    async updateComment({ postId, commentId }: UpdateCommentParamsDto, { content, files = [], tags = [], removeFiles = [], removeTags = [] }: UpdateCommentBodyDto, user: HydratedDocument<IUser>): Promise<IComment> {

        const comment = await this.commentRepository.findOne({
            filter: { _id: commentId, postId: postId, createdBy: user._id }
        });
        if (!comment) {
            throw new NotFoundException("Fail to find matching comment");
        }

        if (!comment.content && !content && !files?.length && comment.attachments?.length == removeFiles.length) {
            throw new BadRequestException("We cannot leave empty comment");
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

        const post = await this.postRepository.findById({ _id: comment.postId as Types.ObjectId });
        const folderId = post?.folderId;
        let attachments: string[] = [];
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files as Express.Multer.File[],
                path: `Post/${folderId}`
            });
        }
        const updatedComment = await this.commentRepository.findOneAndUpdate({
            filter: {
                _id: commentId,
                postId: postId,
                createdBy: user._id
            },
            update: [
                {
                    $set: {
                        content: content || comment.content,
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
            ],
            populate: this.populate
        });

        if (!updatedComment) {
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
                        message: `${user.username} mentioned you in his comment`,
                        postId: postId,
                        commentId: updatedComment._id,
                    })
                }
            });
        }

        return updatedComment.toJSON();
    }

    async deleteComment({ postId, commentId }: DeleteCommentParamsDto, { force }: DeleteCommentQueryDto, user: HydratedDocument<IUser>): Promise<{ deletedCount: number; }> {

        const comment = await this.commentRepository.findOne({
            filter: { _id: commentId, postId: postId }
        });
        if (!comment) {
            throw new NotFoundException("Fail to find matching comment");
        }
        if (comment.createdBy.toString() != user._id.toString()) {
            throw new ForbiddenException("You are not allowed to delete this comment");
        }

        const result = await this.commentRepository.deleteOne({
            filter: { _id: commentId, postId: postId },
            force: Boolean(force)
        });
        if (!result.deletedCount) {
            throw new BadRequestException("Fail to delete comment");
        }
        return result;
    }

    async restoreComment({ postId, commentId }: RestoreCommentParamsDto, user: HydratedDocument<IUser>): Promise<IComment> {

        const comment = await this.commentRepository.findOne({
            filter: { _id: commentId, postId: postId, createdBy: user._id, paranoid: false, deletedAt: { $exists: true } }
        });
        if (!comment) {
            throw new NotFoundException("Fail to find matching deleted comment to restore");
        }

        await this.commentRepository.restoreOne({
            filter: { _id: commentId, postId: postId, createdBy: user._id }
        });

        const restored = await this.commentRepository.findOne({
            filter: { _id: commentId, postId: postId },
            options: { populate: this.populate }
        });
        if (!restored) {
            throw new NotFoundException("Fail to find matching comment");
        }
        return restored.toJSON();
    }

    async reactComment({ postId, commentId }: ReactCommentParamsDto, { react }: ReactCommentBodyDto, user: HydratedDocument<IUser>): Promise<IComment> {
        const comment = await this.commentRepository.findOneAndUpdate({
            filter: { _id: commentId, postId: postId },
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
        if (!comment) {
            throw new NotFoundException("Fail to find matching comment");
        }
        return comment.toJSON();
    }

    async unreactComment({ postId, commentId }: UnreactCommentParamsDto, user: HydratedDocument<IUser>): Promise<IComment> {
        const comment = await this.commentRepository.findOneAndUpdate({
            filter: { _id: commentId, postId: postId },
            update: {
                $pull: { reactions: { user: user._id } }
            },
            populate: this.populate
        });
        if (!comment) {
            throw new NotFoundException("Fail to find matching comment");
        }
        return comment.toJSON();
    }

}

export const commentService = new CommentService();