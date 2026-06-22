import { z } from "zod";
import { generalValidationFields } from "../../common/validation";
import { GenderEnum } from "../../common/enum";

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

export const profileGQL = z.strictObject({
    search: z.string().min(2).optional()
});

export const updateProfile = {
    body: z.strictObject({
        username: generalValidationFields.username.optional(),
        phone: generalValidationFields.phone.optional(),
        DOB: z.coerce.date().optional(),
        gender: z.enum(GenderEnum).optional(),
    }).superRefine((args, ctx) => {
        if (!Object.values(args)?.length) {
            ctx.addIssue({
                code: "custom",
                message: "Insert data to update"
            });
        }
    })
};

export const deleteProfile = {
    query: z.strictObject({
        force: z.coerce.boolean().optional()
    })
};

export const restoreUser = {
    params: z.strictObject({
        userId: generalValidationFields.id
    })
};

export const updateProfileGQL = z.strictObject({
    username: generalValidationFields.username.optional(),
    phone: generalValidationFields.phone.optional(),
    DOB: z.coerce.date().optional(),
    gender: z.enum(GenderEnum).optional(),
}).superRefine((args, ctx) => {
    if (!Object.values(args)?.length) {
        ctx.addIssue({
            code: "custom",
            message: "Insert data to update"
        });
    }
});

export const deleteProfileGQL = z.strictObject({
    force: z.coerce.boolean().optional()
});

export const restoreUserGQL = z.strictObject({
    userId: generalValidationFields.id
});
