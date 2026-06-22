import { OAuth2Client, TokenPayload } from "google-auth-library";
import { EmailEnum, ProviderEnum } from "../../common/enum";
import { BadRequestException, ConflictException, NotFoundException } from "../../common/exceptions";
import { IUser } from "../../common/interfaces";
import { RedisService, redisService, TokenService } from "../../common/services";
import { createOtp } from "../../common/utils";
import { emailEmitter, emailTemplate, sendEmail } from "../../common/utils/email";
import { compareHash, generateEncryption, generateHash } from "../../common/utils/security";
import { UserRepository } from "../../DB/repository/user.repository";
import { ConfirmEmailDTO, LoginDTO, SignupDTO } from "./auth.dto";
import { GOOGLE_IDS } from "../../config/config.service";

export class AuthenticationService {
    private userRepository: UserRepository;
    private redis: RedisService;
    private readonly tokenService: TokenService;
    constructor() {
        this.userRepository = new UserRepository();
        this.redis = redisService;
        this.tokenService = new TokenService();
    }


    // Signup with gmail
    private verifyGoogleAccount = async (idToken: string): Promise<TokenPayload> => {
        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: GOOGLE_IDS,
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new BadRequestException("Fail to verify this account with Google");
        }
        return payload;
    };

    loginWithGmail = async (idToken: string, issuer: string) => {
        const payload = await this.verifyGoogleAccount(idToken);
        const user = await this.userRepository.findOne({
            filter: { email: payload.email as string, provider: ProviderEnum.GOOGLE }
        });
        if (!user) {
            throw new NotFoundException("Invalid login data");
        }
        return await this.tokenService.createLoginCredentials(user, issuer);
    };


    signupWithGmail = async (idToken: string, issuer: string) => {
        const payload = await this.verifyGoogleAccount(idToken);
        console.log(payload);

        const checkExist = await this.userRepository.findOne({
            filter: { email: payload.email as string }
        });
        if (checkExist) {
            if (checkExist?.provider != ProviderEnum.GOOGLE) {
                throw new ConflictException("Invalid login provider");
            }
            return { status: 200, credentials: await this.loginWithGmail(idToken, issuer) };
        }

        const user = await this.userRepository.create({
            data: [{
                firstName: payload.given_name,
                lastName: payload.family_name,
                email: payload.email,
                provider: ProviderEnum.GOOGLE,
                profileImage: payload.picture,
                phone: await generateEncryption("00000"),
                confirmEmail: new Date(),
            }],
        });

        return { status: 201, credentials: await this.tokenService.createLoginCredentials(user[0]!, issuer) };
    };


    private async sendEmailOtp({ title, subject, email }: { title: string, subject: EmailEnum, email: string; }) {
        const blockOtpTTL = await this.redis.ttl(this.redis.blockOtpKey({ email, subject }));
        if (blockOtpTTL > 0) {
            throw new ConflictException(`Sorry we cannot request new otp while the current otp is blocked ${blockOtpTTL}`);
        }
        const currentOtpTTL = await this.redis.ttl(this.redis.otpKey({ email, subject }));
        if (currentOtpTTL > 0) {
            throw new ConflictException(`Sorry we cannot request new otp while the current one is still valid please again after ${currentOtpTTL} seconds`);
        }
        if (await this.redis.get(this.redis.maxTrialOtpKey({ email, subject })) >= 3) {
            await this.redis.set({
                key: this.redis.blockOtpKey({ email, subject }),
                value: 1,
                ttl: 7 * 60
            });
            throw new ConflictException(`Sorry we cannot request new otp while the current otp is blocked ${7 * 60} `);
        }
        const code = createOtp();
        await this.redis.set({
            key: this.redis.otpKey({ email, subject }),
            value: await generateHash({ plaintext: `${code}` }),
            ttl: 120
        });
        await sendEmail({
            to: email,
            subject,
            html: emailTemplate({ code, title })
        });
        if (!await this.redis.get(this.redis.maxTrialOtpKey({ email, subject }))) {
            await this.redis.set({
                key: this.redis.maxTrialOtpKey({ email, subject }),
                value: 1,
                ttl: 6 * 60
            });
        } else {
            await this.redis.incr(this.redis.maxTrialOtpKey({ email, subject }));
        }
    };


    public async signup({ email, password, username, phone }: SignupDTO): Promise<IUser> {

        const checkUserExist = await this.userRepository.findOne({
            filter: { email },
            projection: "email",
            options: { lean: true }
        });
        if (checkUserExist) {
            throw new ConflictException("Email exist");
        }

        const user = await this.userRepository.createOne({
            data: {
                username,
                email,
                password: await generateHash({ plaintext: password }),
                phone: await generateEncryption(phone),
            },
        });

        emailEmitter.emit("sendEmail", async () => {
            await this.sendEmailOtp({ title: "Verify_Email", subject: EmailEnum.ConfirmEmail, email });
        });

        return user;
    }





    async confirmEmail({ otp, email }: ConfirmEmailDTO): Promise<void> {

        const account = await this.userRepository.findOne({
            filter: { email, confirmEmail: { $exists: false }, provider: ProviderEnum.SYSTEM }
        });
        if (!account) {
            throw new NotFoundException("Fail to find account");
        }

        const hashOtp = await this.redis.get(this.redis.otpKey({ email, subject: EmailEnum.ConfirmEmail }));
        if (!hashOtp) {
            throw new NotFoundException("Expired otp");
        }
        if (!await compareHash({ plaintext: otp, cipherText: hashOtp })) {
            throw new ConflictException("Invalid otp");
        }

        account.confirmEmail = new Date();
        await account.save();

        await this.redis.deleteKey(await this.redis.keys(this.redis.otpKey({ email, subject: EmailEnum.ConfirmEmail })));
        return;
    };

    reSendConfirmEmail = async ({ email }: { email: string; }) => {

        const account = await this.userRepository.findOne({
            filter: {
                email,
                confirmEmail: { $exists: false },
                provider: ProviderEnum.SYSTEM
            }
        });
        if (!account) {
            throw new NotFoundException("Invalid account");
        }

        await this.sendEmailOtp({ title: "Verify_Email", subject: EmailEnum.ConfirmEmail, email });

        return;
    };

    public async login(inputs: LoginDTO, issuer: string): Promise<{
        access_token: string;
        refresh_token: string;
    }> {
        const { email, password } = inputs;
        const user = await this.userRepository.findOne({
            filter: { email, confirmEmail: { $exists: true }, provider: ProviderEnum.SYSTEM },
            options: {
                lean: false
            }
        });
        if (!user) {
            throw new NotFoundException("Invalid login data");
        }
        if (!await compareHash({ plaintext: password, cipherText: user.password })) {
            throw new NotFoundException("Invalid login data");
        }

        return this.tokenService.createLoginCredentials(user, issuer);
    }

    // Forgot-password
    requestForgotPasswordCode = async (email: string) => {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                confirmEmail: { $exists: true },
                provider: ProviderEnum.SYSTEM
            }
        });
        if (!account) {
            throw new NotFoundException("Invalid Account");
        }
        await this.sendEmailOtp({ title: "Forgot_Password", subject: EmailEnum.ForgotPassword, email });
        return;
    };


    verifyForgotPasswordCode = async (email: string, otp: string) => {
        const hashOtp = await this.redis.get(this.redis.otpKey({ email, subject: EmailEnum.ForgotPassword }));
        if (!hashOtp) {
            throw new NotFoundException(`Expired OTP`);
        }
        if (!await compareHash({ plaintext: otp, cipherText: hashOtp })) {
            throw new ConflictException(`Invalid OTP`);
        }
        return;
    };

    resetForgotPasswordCode = async ({ email, otp, password }: { email: string; otp: string; password: string; }) => {
        await this.verifyForgotPasswordCode(email, otp);
        const account = await this.userRepository.findOne({
            filter: {
                email,
                confirmEmail: { $exists: true },
                provider: ProviderEnum.SYSTEM
            },
            options: {
                lean: false
            }
        });
        if (!account) {
            throw new NotFoundException("Invalid account");
        }
        account.password = await generateHash({ plaintext: password });
        account.changeCredentialsTime = new Date();
        await account.save();

        const otpKeys = await this.redis.keys(this.redis.otpKey({ email, subject: EmailEnum.ForgotPassword }));
        const tokenKeys = await this.redis.keys(this.redis.baseRevokeTokenKey(account._id));
        await this.redis.deleteKey([...otpKeys, ...tokenKeys]);

        return;
    };
};

export default new AuthenticationService();