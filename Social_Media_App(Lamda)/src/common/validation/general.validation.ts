import { Types } from "mongoose";
import { z } from "zod";

export const generalValidationFields = {
    id: z.string().refine(value => { return Types.ObjectId.isValid(value); }, "Invalid ObjectId"),
    email: z.email({ error: "Invalid email address" }),
    otp: z.string({ error: "OTP is required" }).regex(/^\d{6}$/),
    phone: z.string({ error: "Phone is required" })
        .regex(/^(02|2|\+2)?01[0-25]\d{8}$/),
    password: z.string({ error: "Password is required" }).regex(/^(?=.*[a-z]){1,}(?=.*[A-Z]){1,}(?=.*\W){1,}[\w\W\d].{8,25}$/,),
    username: z.string({ error: "Username is required" }).min(2, { error: "min is 2 char" }).max(25, { error: "min is 2 char" }),
    confirmPassword: z.string({ error: "Confirm password is required" }),
    file: function (mimetype: string[]) {
        return z.strictObject({
            fieldname: z.string(),
            originalname: z.string(),
            encoding: z.string(),
            mimetype: z.enum(mimetype),
            buffer: z.any().optional(),
            path: z.string().optional(),
            size: z.number(),
        }).superRefine((args, ctx) => {
            if (!args.path && !args.buffer) {
                ctx.addIssue({
                    code: "custom",
                    path: ['buffer'],
                    message: "Buffer is required"
                });
            }
        });
    }

};

export const paginationvalidationSchema = {
    query: z.strictObject({
        page: z.coerce.number().optional(),
        size: z.coerce.number().optional(),
        search: z.string().optional(),
    })
};

export type PaginateDto = z.infer<typeof paginationvalidationSchema.query>;