"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalValidationFields = void 0;
const zod_1 = require("zod");
exports.generalValidationFields = {
    email: zod_1.z.email({ error: "Invalid email address" }),
    password: zod_1.z.string({ error: "Password is required" })
        .regex(/^(?=.*[a-z]){1,}(?=.*[A-Z]){1,}(?=.*\W){1,}[\w\W\d].{8,25}$/, { message: "Password must be 8 characters or more and contain at least one A-Z letter and 1-9 and a special character" }),
    username: zod_1.z.string({ error: "Username is required" }).min(2).max(20),
    confirmPassword: zod_1.z.string({ error: "Confirm password is required" }),
    phone: zod_1.z.string({ error: "Phone is required" })
        .regex(new RegExp(/^(02|2|\+2)?01[0-25]\d{8}$/)),
    otp: zod_1.z.string().regex(new RegExp(/^\d{6}$/)),
};
