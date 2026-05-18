"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationService = void 0;
const google_auth_library_1 = require("google-auth-library");
const enum_1 = require("../../common/enum");
const exceptions_1 = require("../../common/exceptions");
const services_1 = require("../../common/services");
const utils_1 = require("../../common/utils");
const email_1 = require("../../common/utils/email");
const security_1 = require("../../common/utils/security");
const user_repository_1 = require("../../DB/repository/user.repository");
const config_service_1 = require("../../config/config.service");
class AuthenticationService {
    userRepository;
    redis;
    tokenService;
    constructor() {
        this.userRepository = new user_repository_1.UserRepository();
        this.redis = services_1.redisService;
        this.tokenService = new services_1.TokenService();
    }
    verifyGoogleAccount = async (idToken) => {
        const client = new google_auth_library_1.OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: config_service_1.GOOGLE_IDS,
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new exceptions_1.BadRequestException("Fail to verify this account with Google");
        }
        return payload;
    };
    loginWithGmail = async (idToken, issuer) => {
        const payload = await this.verifyGoogleAccount(idToken);
        const user = await this.userRepository.findOne({
            filter: { email: payload.email, provider: enum_1.ProviderEnum.GOOGLE }
        });
        if (!user) {
            throw new exceptions_1.NotFoundException("Invalid login data");
        }
        return await this.tokenService.createLoginCredentials(user, issuer);
    };
    signupWithGmail = async (idToken, issuer) => {
        const payload = await this.verifyGoogleAccount(idToken);
        console.log(payload);
        const checkExist = await this.userRepository.findOne({
            filter: { email: payload.email }
        });
        if (checkExist) {
            if (checkExist?.provider != enum_1.ProviderEnum.GOOGLE) {
                throw new exceptions_1.ConflictException("Invalid login provider");
            }
            return { status: 200, credentials: await this.loginWithGmail(idToken, issuer) };
        }
        const user = await this.userRepository.create({
            data: [{
                    firstName: payload.given_name,
                    lastName: payload.family_name,
                    email: payload.email,
                    provider: enum_1.ProviderEnum.GOOGLE,
                    profileImage: payload.picture,
                    phone: await (0, security_1.generateEncryption)("00000"),
                    confirmEmail: new Date(),
                }],
        });
        return { status: 201, credentials: await this.tokenService.createLoginCredentials(user[0], issuer) };
    };
    async sendEmailOtp({ title, subject, email }) {
        const blockOtpTTL = await this.redis.ttl(this.redis.blockOtpKey({ email, subject }));
        if (blockOtpTTL > 0) {
            throw new exceptions_1.ConflictException(`Sorry we cannot request new otp while the current otp is blocked ${blockOtpTTL}`);
        }
        const currentOtpTTL = await this.redis.ttl(this.redis.otpKey({ email, subject }));
        if (currentOtpTTL > 0) {
            throw new exceptions_1.ConflictException(`Sorry we cannot request new otp while the current one is still valid please again after ${currentOtpTTL} seconds`);
        }
        if (await this.redis.get(this.redis.maxTrialOtpKey({ email, subject })) >= 3) {
            await this.redis.set({
                key: this.redis.blockOtpKey({ email, subject }),
                value: 1,
                ttl: 7 * 60
            });
            throw new exceptions_1.ConflictException(`Sorry we cannot request new otp while the current otp is blocked ${7 * 60} `);
        }
        const code = (0, utils_1.createOtp)();
        await this.redis.set({
            key: this.redis.otpKey({ email, subject }),
            value: await (0, security_1.generateHash)({ plaintext: `${code}` }),
            ttl: 120
        });
        await (0, email_1.sendEmail)({
            to: email,
            subject,
            html: (0, email_1.emailTemplate)({ code, title })
        });
        if (!await this.redis.get(this.redis.maxTrialOtpKey({ email, subject }))) {
            await this.redis.set({
                key: this.redis.maxTrialOtpKey({ email, subject }),
                value: 1,
                ttl: 6 * 60
            });
        }
        else {
            await this.redis.incr(this.redis.maxTrialOtpKey({ email, subject }));
        }
    }
    ;
    async signup({ email, password, username, phone }) {
        const checkUserExist = await this.userRepository.findOne({
            filter: { email },
            projection: "email",
            options: { lean: true }
        });
        if (checkUserExist) {
            throw new exceptions_1.ConflictException("Email exist");
        }
        const user = await this.userRepository.createOne({
            data: {
                username,
                email,
                password: await (0, security_1.generateHash)({ plaintext: password }),
                phone: await (0, security_1.generateEncryption)(phone),
            },
        });
        email_1.emailEmitter.emit("sendEmail", async () => {
            await this.sendEmailOtp({ title: "Verify_Email", subject: enum_1.EmailEnum.ConfirmEmail, email });
        });
        return user;
    }
    async confirmEmail({ otp, email }) {
        const account = await this.userRepository.findOne({
            filter: { email, confirmEmail: { $exists: false }, provider: enum_1.ProviderEnum.SYSTEM }
        });
        if (!account) {
            throw new exceptions_1.NotFoundException("Fail to find account");
        }
        const hashOtp = await this.redis.get(this.redis.otpKey({ email, subject: enum_1.EmailEnum.ConfirmEmail }));
        if (!hashOtp) {
            throw new exceptions_1.NotFoundException("Expired otp");
        }
        if (!await (0, security_1.compareHash)({ plaintext: otp, cipherText: hashOtp })) {
            throw new exceptions_1.ConflictException("Invalid otp");
        }
        account.confirmEmail = new Date();
        await account.save();
        await this.redis.deleteKey(await this.redis.keys(this.redis.otpKey({ email, subject: enum_1.EmailEnum.ConfirmEmail })));
        return;
    }
    ;
    reSendConfirmEmail = async ({ email }) => {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                confirmEmail: { $exists: false },
                provider: enum_1.ProviderEnum.SYSTEM
            }
        });
        if (!account) {
            throw new exceptions_1.NotFoundException("Invalid account");
        }
        await this.sendEmailOtp({ title: "Verify_Email", subject: enum_1.EmailEnum.ConfirmEmail, email });
        return;
    };
    async login(inputs, issuer) {
        const { email, password } = inputs;
        const user = await this.userRepository.findOne({
            filter: { email, confirmEmail: { $exists: true }, provider: enum_1.ProviderEnum.SYSTEM },
            options: {
                lean: false
            }
        });
        if (!user) {
            throw new exceptions_1.NotFoundException("Invalid login data");
        }
        if (!await (0, security_1.compareHash)({ plaintext: password, cipherText: user.password })) {
            throw new exceptions_1.NotFoundException("Invalid login data");
        }
        return this.tokenService.createLoginCredentials(user, issuer);
    }
    requestForgotPasswordCode = async (email) => {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                confirmEmail: { $exists: true },
                provider: enum_1.ProviderEnum.SYSTEM
            }
        });
        if (!account) {
            throw new exceptions_1.NotFoundException("Invalid Account");
        }
        await this.sendEmailOtp({ title: "Forgot_Password", subject: enum_1.EmailEnum.ForgotPassword, email });
        return;
    };
    verifyForgotPasswordCode = async (email, otp) => {
        const hashOtp = await this.redis.get(this.redis.otpKey({ email, subject: enum_1.EmailEnum.ForgotPassword }));
        if (!hashOtp) {
            throw new exceptions_1.NotFoundException(`Expired OTP`);
        }
        if (!await (0, security_1.compareHash)({ plaintext: otp, cipherText: hashOtp })) {
            throw new exceptions_1.ConflictException(`Invalid OTP`);
        }
        return;
    };
    resetForgotPasswordCode = async ({ email, otp, password }) => {
        await this.verifyForgotPasswordCode(email, otp);
        const account = await this.userRepository.findOne({
            filter: {
                email,
                confirmEmail: { $exists: true },
                provider: enum_1.ProviderEnum.SYSTEM
            },
            options: {
                lean: false
            }
        });
        if (!account) {
            throw new exceptions_1.NotFoundException("Invalid account");
        }
        account.password = await (0, security_1.generateHash)({ plaintext: password });
        account.changeCredentialsTime = new Date();
        await account.save();
        const otpKeys = await this.redis.keys(this.redis.otpKey({ email, subject: enum_1.EmailEnum.ForgotPassword }));
        const tokenKeys = await this.redis.keys(this.redis.baseRevokeTokenKey(account._id));
        await this.redis.deleteKey([...otpKeys, ...tokenKeys]);
        return;
    };
}
exports.AuthenticationService = AuthenticationService;
;
exports.default = new AuthenticationService();
