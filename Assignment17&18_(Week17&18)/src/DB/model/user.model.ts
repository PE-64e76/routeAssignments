import { model, models, Schema } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enum";
import { IUser } from "../../common/interfaces";


const userSchema = new Schema<IUser>({
    firstName: { type: String, required: [true, "First name is required"], minLength: 2, maxLength: 25 },
    lastName: { type: String, required: [true, "Last name is required"], minLength: 2, maxLength: 25 },
    email: { type: String, required: true, unique: true },
    password: {
        type: String, required: function (this) {
            return this.provider == ProviderEnum.SYSTEM;
        }
    },
    bio: { type: String, maxLength: 25 },
    phone: { type: String, required: true },
    profileImage: { type: String, required: false },
    coverImage: { type: [String], required: false },
    DOB: { type: Date, required: false },
    changeCredentialsTime: { type: Date, required: false },
    confirmEmail: { type: Date, required: false },

    provider: { type: Number, enum: ProviderEnum, default: ProviderEnum.SYSTEM },
    gender: { type: Number, enum: GenderEnum, default: GenderEnum.MALE },
    role: { type: Number, enum: RoleEnum, default: RoleEnum.USER },


}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: "SOCIAL_APP_Users",
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});

userSchema.virtual("username").get(function (this: IUser) {
    return `${this.firstName} ${this.lastName}`;
}).set(function (this: IUser, value: string) {
    const [firstName, lastName] = value.split(" ");
    this.firstName = firstName as string;
    this.lastName = lastName as string;
});

export const UserModel = models.User || model<IUser>("User", userSchema);