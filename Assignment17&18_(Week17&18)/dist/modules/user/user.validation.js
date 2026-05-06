"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = void 0;
const zod_1 = require("zod");
const validation_1 = require("../../common/validation");
exports.updatePassword = {
    body: zod_1.z.strictObject({
        oldPassword: validation_1.generalValidationFields.password,
        password: validation_1.generalValidationFields.password,
        confirmPassword: validation_1.generalValidationFields.confirmPassword
    }).refine((data) => {
        return data.password === data.confirmPassword;
    }, { error: 'Password mismatch with confirm password' })
        .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                path: ['confirmPassword'],
                message: "Password mismatch with confirm password",
                code: "custom"
            });
        }
        if (data.password === data.oldPassword) {
            ctx.addIssue({
                path: ['password'],
                message: "New password cannot be the same as old password",
                code: "custom"
            });
        }
    })
};
