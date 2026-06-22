import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { IPost } from "./post.interface";
import { IReaction } from "./reaction.interface";


export interface IComment {

    content?: string;
    attachments?: string[];

    reactions?: IReaction[];
    tags?: Types.ObjectId[] | IUser[];

    postId: Types.ObjectId | IPost;
    commentId?: Types.ObjectId | IComment;

    createdBy: Types.ObjectId | IUser;
    updatedBy?: Types.ObjectId | IUser;

    createdAt: Date;
    deletedAt?: Date;
    restoredAt?: Date;
    updatedAt?: Date;

}