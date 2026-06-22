import { HydratedDocument, model, models, Schema } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enum";
import { IUser } from "../../common/interfaces";
import { generateEncryption, generateHash } from "../../common/utils/security";
import { Types } from "mongoose";
import { PostModel } from "./post.model";
import { CommentModel } from "./comment.model";



const userSchema = new Schema<IUser>({

    firstName: { type: String, required: [true, "First name is required"], minLength: 2, maxLength: 25 },
    lastName: { type: String, required: [true, "Last name is required"], minLength: 2, maxLength: 25 },
    slug: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
        type: String, required: function (this) {
            return this.provider == ProviderEnum.SYSTEM;
        }
    },
    phone: { type: String, required: true },
    profilePicture: { type: String, required: false },
    profileCoverPictures: { type: String, required: false },
    
    friends: [{type: Types.ObjectId, ref:"User"}],

    DOB: { type: Date, required: false },
    deletedAt: { type: Date },
    restoredAt: { type: Date },
    confirmEmail: { type: Date },
    changeCredentialsTime: { type: Date },


    gender: { type: Number, enum: GenderEnum, default: GenderEnum.MALE },
    provider: { type: Number, enum: ProviderEnum, default: ProviderEnum.SYSTEM },
    role: { type: Number, enum: RoleEnum, default: RoleEnum.USER },


}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
    collection: "SOCIAL_APP_Users"
});

userSchema.pre(["find", "findOne", "countDocuments"], function () {
    if (this.getQuery().paranoid == false) {
        this.setQuery({
            ...this.getQuery(),
        });
    } else {
        this.setQuery({
            ...this.getQuery(),
            deletedAt: { $exists: false }
        });
    }
});

userSchema.pre(["updateOne", "findOneAndUpdate"], async function () {
    const update = this.getUpdate() as HydratedDocument<IUser>;

    if (update.deletedAt) {
        this.setUpdate({
            ...update,
            $unset: { restoredAt: 1 }
        });

        const { force: _force, ...lookupFilter } = this.getQuery();
        const users = await this.model.find(lookupFilter).select("_id");
        const userIds = users.map(user => user._id);
        if (userIds.length) {
            await PostModel.updateMany({ createdBy: { $in: userIds } }, { deletedAt: new Date() });
            await CommentModel.updateMany({ createdBy: { $in: userIds } }, { deletedAt: new Date() });
        }
    }
    if (update.restoredAt) {
        this.setQuery({
            ...this.getQuery(),
            paranoid: false,
            deletedAt: { $exists: false }
        });
        this.setUpdate({
            ...this.getUpdate(),
            $unset: { deletedAt: 1 }
        });
    }
    if (this.getQuery().paranoid == false) {
        this.setQuery({
            ...this.getQuery(),
        });
    } else {
        this.setQuery({
            ...this.getQuery(),
            deletedAt: { $exists: false }
        });
    }
});

userSchema.pre(["deleteOne", "findOneAndDelete"], async function () {
    const force = this.getQuery().force == true;
    if (force) {
        this.setQuery({
            ...this.getQuery(),
        });
    } else {
        this.setQuery({
            ...this.getQuery(),
            deletedAt: { $exists: false }
        });
    }

    if (force) {
        const { force: _force, ...lookupFilter } = this.getQuery();
        const users = await this.model.find(lookupFilter).select("_id");
        const userIds = users.map(user => user._id);
        if (userIds.length) {
            await PostModel.deleteMany({ createdBy: { $in: userIds }, force: true });
            await CommentModel.deleteMany({ createdBy: { $in: userIds }, force: true });
        }
    }
});



userSchema.virtual("username").set(function (value: string) {
    const [firstName, lastName] = value.split(" ") || [];
    this.firstName = firstName as string;
    this.lastName = lastName as string;
    this.slug = value.replaceAll(/\s+/g, "-");
}).get(function () {
    return `${this.firstName} ${this.lastName}`;
});



userSchema.pre("save", async function (this: HydratedDocument<IUser> & { wasNew: boolean; }) {
    this.wasNew = this.isNew;
    if (this.isModified("password")) {
        this.password = await generateHash({ plaintext: this.password });
    }
    if (this.phone && this.isModified("phone")) {
        this.phone = await generateEncryption(this.phone);
    }
});

export const UserModel = models.User || model<IUser>("User", userSchema);
UserModel.syncIndexes();