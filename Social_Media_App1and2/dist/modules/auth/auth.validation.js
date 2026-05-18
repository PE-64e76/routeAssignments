"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetForgotPasswordCode = exports.verifyForgotPasswordCode = exports.requestForgotPasswordCode = exports.confirmEmail = exports.resendConfirmEmail = exports.signup = exports.login = void 0;
const zod_1 = require("zod");
const validation_1 = require("../../common/validation");
exports.login = {
    body: zod_1.z.strictObject({
        email: validation_1.generalValidationFields.email,
        password: validation_1.generalValidationFields.password,
    })
};
exports.signup = {
    body: exports.login.body.extend({
        username: validation_1.generalValidationFields.username,
        confirmPassword: validation_1.generalValidationFields.confirmPassword,
        phone: validation_1.generalValidationFields.phone
    }).refine((data) => {
        return data.password === data.confirmPassword;
    }, { error: 'Password mismatch with confirm password' })
        .superRefine((data, ctx) => {
        if (data.confirmPassword !== data.password) {
            ctx.addIssue({
                path: ['confirmPassword'],
                message: "Password mismatch with confirm password",
                code: "custom"
            });
        }
        if (data.email.includes(".lol")) {
            ctx.addIssue({
                path: ['email'],
                message: "invalid",
                code: "custom"
            });
        }
    })
};
exports.resendConfirmEmail = {
    body: zod_1.z.strictObject({
        email: validation_1.generalValidationFields.email,
    })
};
exports.confirmEmail = {
    body: exports.resendConfirmEmail.body.safeExtend({
        otp: validation_1.generalValidationFields.otp
    })
};
exports.requestForgotPasswordCode = {
    body: zod_1.z.strictObject({
        email: validation_1.generalValidationFields.email
    })
};
exports.verifyForgotPasswordCode = {
    body: zod_1.z.strictObject({
        email: validation_1.generalValidationFields.email,
        otp: validation_1.generalValidationFields.otp
    })
};
exports.resetForgotPasswordCode = {
    body: zod_1.z.strictObject({
        email: validation_1.generalValidationFields.email,
        otp: validation_1.generalValidationFields.otp,
        password: validation_1.generalValidationFields.password
    })
};
