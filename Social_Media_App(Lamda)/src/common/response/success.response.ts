import type { Response } from "express";

export const successResponse = <T = any>({
    res,
    message = "Done",
    status = 200,
    data,
}: {
    res: Response,
    message?: string,
    data?: T,
    status?: number;
}) => {
    return res.status(status).json({
        message,
        status,
        data
    });
};