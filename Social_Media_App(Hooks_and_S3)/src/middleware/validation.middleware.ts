import { NextFunction, Request, Response } from "express";
import { BadRequestException } from "../common/exceptions";
import type { ZodError, ZodType } from "zod";

type keyRequestType = keyof Request;

type ValidationSchemaType = Partial<Record<keyRequestType, ZodType>>;

type ValidationErrorType = Array<{
    key: keyRequestType,
    issues: Array<{
        message: string,
        path: Array<string | number | undefined | symbol>;
    }>;
}>;

export const validation = (schema: ValidationSchemaType) => {

    return (req: Request, res: Response, next: NextFunction) => {

        const validationErrors: ValidationErrorType = [];

        for (const key of Object.keys(schema) as keyRequestType[]) {
            if (!schema[key]) continue;

            const validationResult = schema[key].safeParse(req[key]);
            if (!validationResult.success) {
                const error = validationResult.error as ZodError;
                validationErrors.push({
                    key, issues: error.issues.map(issue => {
                        return { message: issue.message, path: issue.path };
                    })
                });
            }
        }
        if (validationErrors.length) {
            throw new BadRequestException("Validation failed", validationErrors);
        }
        next();
    };
};