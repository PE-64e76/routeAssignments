import { GenderEnum, ProviderEnum, RoleEnum } from "../enum";

export interface IUser {
    firstName: string;
    lastName: string;
    username?: string;

    email: string;
    password: string;
    bio?: string;
    phone: string;
    profileImage?: string;
    coverImage?: string[];
    DOB?: Date;
    confirmEmail?: Date;
    changeCredentialsTime?: Date;
    provider?: ProviderEnum;
    gender: GenderEnum;
    role: RoleEnum;

    createdAt: Date;
    updatedAt: Date;


}