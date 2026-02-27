import joi from "joi";
import { fileFieldValidation } from "../../common/utils/multer/validation.multer.js";
import { generalValidationFields } from "../../common/utils/validation.js";

export const shareProfile = {
  params: joi.object({
    userId: joi.string().hex().length(24).required(),
  }),
};

export const profileImage = {
  file: generalValidationFields.file(fileFieldValidation.image).required()
};

export const profileCoverImage = {
  files: joi.array().items(
    generalValidationFields.file(fileFieldValidation.image).required()
  ).min(1).max(5).required()
};

export const uploadProfileImage = {
  file: generalValidationFields.file(fileFieldValidation.image).required()
};

export const removeProfileImage = {};

export const visitProfile = {
  params: joi.object({
    userId: joi.string().hex().length(24).required(),
  }),
};

export const profileAttachments = {
  files: joi.object().keys({
    profileImage:
    joi.array().items(
      generalValidationFields.file(fileFieldValidation.image).required()
    ).length(1).required(),

    profileCoverImage:
    joi.array().items(
      generalValidationFields.file(fileFieldValidation.image).required()
    ).min(1).max(5).required()
  }).required()
}
