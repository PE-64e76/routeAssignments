import { Types } from "mongoose";
import { IUser } from "./user.interface";

export interface IStory {
    content?: string;
    attachments?: string[];

    viewers?: Types.ObjectId[] | IUser[];

    createdBy: Types.ObjectId | IUser;

    createdAt: Date;
    expiresAt: Date;
}
