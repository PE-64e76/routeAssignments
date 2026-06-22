import { HydratedDocument, model, models, Schema } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enum";
import { IUser } from "../../common/interfaces";
import { generateEncryption, generateHash } from "../../common/utils/security";



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
    bio: { type: String, maxLength: 25 },
    phone: { type: String, required: true },
    profilePicture: { type: String, required: false },
    profileCoverPictures: { type: String, required: false },
    coverImage: { type: [String], required: false },
    DOB: { type: Date, required: false },
    changeCredentialsTime: { type: Date },
    confirmEmail: { type: Date },
    deletedAt: { type: Date },
    restoredAt: { type: Date },

    provider: { type: Number, enum: ProviderEnum, default: ProviderEnum.SYSTEM },
    gender: { type: Number, enum: GenderEnum, default: GenderEnum.MALE },
    role: { type: Number, enum: RoleEnum, default: RoleEnum.USER },


}, {
    timestamps: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict: true,
    collection: "SOCIAL_APP_Users"
});

userSchema.pre(["findOne", "find"], function () {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    } else {
        this.setQuery({ ...query, deletedAt: { $exists: false } });
    }
});

userSchema.pre(["updateOne", "findOneAndUpdate"], function () {
    const update = this.getUpdate() as HydratedDocument<IUser>;
    if (update.deletedAt) {
        this.setUpdate({ ...update, $unset: { restoredAt: 1 } });

    }
    if (update.restoredAt) {
        this.setUpdate({ ...update, $unset: { deletedAt: 1 } });
        this.setQuery({ ...this.getQuery(), deletedAt: { $exists: true } });
    }

    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    } else {
        this.setQuery({ deletedAt: { $exists: false }, ...query });
    }
});

userSchema.pre(["deleteOne", "findOneAndDelete"], function () {

    const query = this.getQuery();
    if (query.force === true) {
        this.setQuery({ ...query });
    } else {
        this.setQuery({ deletedAt: { $exists: true }, ...query });
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