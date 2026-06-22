import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import authService from "./auth.service";
import { successResponse } from "../../common/response";
import * as validators from "./auth.validation";
import { validation } from "../../middleware";
import { ILoginResponse } from "./auth.entity";


const router = Router();

router.post("/login",
    validation(validators.login),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await authService.login(req.body, req.host);
        return successResponse<ILoginResponse>({ res, data });
    });

router.post("/signup/gmail", async (req, res, next) => {
    const { status, credentials } = await authService.signupWithGmail(req.body.idToken, `${req.protocol}://${req.host}`);
    return successResponse({ res, status, data: { ...credentials } });
});

router.post("/signup",
    validation(validators.signup),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await authService.signup(req.body);
        return successResponse<any>({ res, status: 201, data });
    });

router.patch("/confirm-email",
    validation(validators.confirmEmail),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        await authService.confirmEmail(req.body);
        return successResponse({ res });
    });

router.patch("/resend-confirm-email",
    validation(validators.resendConfirmEmail),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        await authService.reSendConfirmEmail(req.body);
        return successResponse({ res });
    });


router.post("/request-forget-password-code",
    validation(validators.requestForgotPasswordCode),
    async (req: Request, res: Response, next: NextFunction) => {
        await authService.requestForgotPasswordCode(req.body.email);
        return successResponse({ res, status: 201 });
    });

router.patch("/verify-forget-password-code",
    validation(validators.verifyForgotPasswordCode),
    async (req: Request, res: Response, next: NextFunction) => {
        await authService.verifyForgotPasswordCode(req.body.email, req.body.otp);
        return successResponse({ res, status: 200 });
    });

router.patch("/reset-forget-password-code",
    validation(validators.resetForgotPasswordCode),
    async (req: Request, res: Response, next: NextFunction) => {
        await authService.resetForgotPasswordCode(req.body);
        return successResponse({ res, status: 200 });
    });



export default router;