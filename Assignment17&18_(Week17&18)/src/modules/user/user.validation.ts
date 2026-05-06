import { z } from "zod";
import { generalValidationFields } from "../../common/validation";

export const updatePassword = {
    body: z.strictObject({
        oldPassword: generalValidationFields.password,
        password: generalValidationFields.password,
        confirmPassword: generalValidationFields.confirmPassword
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
