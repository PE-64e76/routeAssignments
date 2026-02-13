import multer from "multer";
import { BadRequestException } from "../response/error.response.js";

export const allowedFileTypesEnum = {
  Image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  Document: ["application/pdf", "application/msword"],
  Video: ["video/mp4", "video/mpeg"],
};

export const uploadToCloud = ({ allowedTypes = allowedFileTypesEnum.Image } = {}) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = file.originalname.split(".").pop();
      cb(null, `${uniqueSuffix}.${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        BadRequestException({
          message: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
        }),
        false
      );
    }
  };

  return multer({ storage, fileFilter });
};
