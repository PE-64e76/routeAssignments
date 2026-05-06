import { z } from "zod";

export const generalValidationFields = {
    email: z.email({ error: "Invalid email address" }),
    password: z.string({ error: "Password is required" })
        .regex(/^(?=.*[a-z]){1,}(?=.*[A-Z]){1,}(?=.*\W){1,}[\w\W\d].{8,25}$/,
            { message: "Password must be 8 characters or more and contain at least one A-Z letter and 1-9 and a special character" }),
    username: z.string({ error: "Username is required" }).min(2).max(20),
    confirmPassword: z.string({ error: "Confirm password is required" }),
    phone: z.string({error:"Phone is required"})
        .regex(new RegExp(/^(02|2|\+2)?01[0-25]\d{8}$/)),
    otp: z.string().regex(new RegExp(/^\d{6}$/)),
    
};