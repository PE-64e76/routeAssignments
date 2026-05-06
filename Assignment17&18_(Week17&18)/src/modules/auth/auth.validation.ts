import { z } from "zod";
import { generalValidationFields } from "../../common/validation";

export const login = {
    body: z.strictObject({
        email: generalValidationFields.email,
        password: generalValidationFields.password,
    })
};

export const signup = {
    body: login.body.extend({
        username: generalValidationFields.username,
        confirmPassword: generalValidationFields.confirmPassword,
        phone: generalValidationFields.phone
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

export const resendConfirmEmail = {
    body: z.strictObject({
        email: generalValidationFields.email,
    })
};

export const confirmEmail = {
    body: resendConfirmEmail.body.safeExtend({
        otp: generalValidationFields.otp
    })
};

export const requestForgotPasswordCode = {
    body: z.strictObject({
        email: generalValidationFields.email
    })
};

export const verifyForgotPasswordCode = {
    body: z.strictObject({
        email: generalValidationFields.email,
        otp: generalValidationFields.otp
    })
};

export const resetForgotPasswordCode = {
    body: z.strictObject({
        email: generalValidationFields.email,
        otp: generalValidationFields.otp,
        password: generalValidationFields.password
    })
};