import joi from "joi";
import { generalValidationFields } from "../../common/utils/validation.js";

export const login = {
    body: joi.object().keys({
    email: generalValidationFields.email.required(),
    password: generalValidationFields.password.required()
}).required()
}

export const signup = {
    body: login.body.append({
        username: generalValidationFields.username.required(),
        phone:generalValidationFields.phone.required(),
        confirmPassword: generalValidationFields.confirmPassword("password").required()
    }).required(),
}

export const reSendConfirmEmail = {
    body: joi.object().keys({
        email: generalValidationFields.email.required(),
    }).required(),
}

export const confirmEmail = {
    body: joi.object().keys({
        email: generalValidationFields.email.required(),
        otp: generalValidationFields.otp.required()
    }).required(),
}

export const loginConfirmation = {
    body: joi.object().keys({
    loginId: joi.string().required(),
    otp: generalValidationFields.otp.required()
}).required()
}

export const verifyTwoStepVerification = {
    body: joi.object().keys({
        otp: generalValidationFields.otp.required()
    }).required(),
}

export const updatePassword = {
    body: joi.object().keys({
        oldPassword: generalValidationFields.password.required(),
        password: generalValidationFields.password.required(),
        confirmPassword: generalValidationFields.confirmPassword("password").required()
    }).required(),
}

export const forgetPassword = {
    body: joi.object().keys({
        email: generalValidationFields.email.required(),
    }).required(),
}

export const resetPassword = {
    body: joi.object().keys({
        email: generalValidationFields.email.required(),
        otp: generalValidationFields.otp.required(),
        password: generalValidationFields.password.required(),
        confirmPassword: generalValidationFields.confirmPassword("password").required()
    }).required(),
}