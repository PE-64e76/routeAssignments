import { Types } from "mongoose";
import { ReactionEnum } from "../enum";
import { IUser } from "./user.interface";

export interface IReaction {
    user: Types.ObjectId | IUser;
    type: ReactionEnum;
}
