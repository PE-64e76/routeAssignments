import type { Request } from "express";
import { FileFilterCallback } from "multer";
import { BadRequestException } from "../../exceptions";

export const fileFieldValidation = {
    image: ['image/jpeg', 'image/jpg', 'image/jpg', 'image/png'],
    video: ['vides/mp4'],
    attachment: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'video/mp4'],
};

export const fileFilter = (validation: string[]) => {
    return function (req: Request, file: Express.Multer.File, cb:FileFilterCallback) {
        if (!validation.includes(file.mimetype)) {
            return cb(new BadRequestException("Invalid file format"));
        }
        return cb(null, true);
    };
};
