"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const enum_1 = require("../../common/enum");
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: [true, "First name is required"], minLength: 2, maxLength: 25 },
    lastName: { type: String, required: [true, "Last name is required"], minLength: 2, maxLength: 25 },
    email: { type: String, required: true, unique: true },
    password: {
        type: String, required: function () {
            return this.provider == enum_1.ProviderEnum.SYSTEM;
        }
    },
    bio: { type: String, maxLength: 25 },
    phone: { type: String, required: true },
    profileImage: { type: String, required: false },
    coverImage: { type: [String], required: false },
    DOB: { type: Date, required: false },
    changeCredentialsTime: { type: Date, required: false },
    confirmEmail: { type: Date, required: false },
    provider: { type: Number, enum: enum_1.ProviderEnum, default: enum_1.ProviderEnum.SYSTEM },
    gender: { type: Number, enum: enum_1.GenderEnum, default: enum_1.GenderEnum.MALE },
    role: { type: Number, enum: enum_1.RoleEnum, default: enum_1.RoleEnum.USER },
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: "SOCIAL_APP_Users",
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});
userSchema.virtual("username").get(function () {
    return `${this.firstName} ${this.lastName}`;
}).set(function (value) {
    const [firstName, lastName] = value.split(" ");
    this.firstName = firstName;
    this.lastName = lastName;
});
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)("User", userSchema);
