import { Types } from "mongoose";
import { IUser } from "./user.interface";

export interface INotification {
    title: string;
    body: string;

    recipients?: Types.ObjectId[] | IUser[];
    isBroadcast: boolean;

    readBy?: Types.ObjectId[] | IUser[];

    createdBy: Types.ObjectId | IUser;
    updatedBy?: Types.ObjectId | IUser;

    createdAt: Date;
    deletedAt?: Date;
    restoredAt?: Date;
    updatedAt?: Date;
}
