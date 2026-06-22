import { Types } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../enum";

export interface IUser {
    firstName: string;
    lastName: string;
    slug: string;
    username?: string;
    friends?: Types.ObjectId[] | IUser[];
    email: string;
    password: string;
    phone: string;
    profilePicture?: string;
    profileCoverPictures?: string[];
    
    
    DOB?: Date;
    deletedAt: Date;
    restoredAt: Date;
    confirmEmail?: Date;
    changeCredentialsTime?: Date;

    gender: GenderEnum;
    provider?: ProviderEnum;
    role: RoleEnum;

    extra:{
        name:string
    }



}