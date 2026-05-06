import { NextFunction, Request, Response, Router } from "express";
import { successResponse } from "../../common/response";
import userService from "./user.service";
import { authentication, authorization, validation } from "../../middleware";
import { endpoint } from "./user.authorization";
import { TokenTypeEnum } from "../../common/enum";
import * as validators from "./user.validation";



const router = Router();

router.post(
    "/logout",
    authentication(),
    async (req: Request, res: Response, next: NextFunction) => {
        const status = await userService.logout(req.body.flag, req.user, req.decoded as { sub: string, iat: number, jti: string; });
        return successResponse({ res, status });
    });

router.get("/",
    authentication(),
    authorization(endpoint.profile),
    async (req: Request, res: Response, next: NextFunction) => {
        const data = await userService.profile(req.user);
        return successResponse({ res, data });
    });

router.post(
    "/rotate-token",
    authentication(TokenTypeEnum.REFRESH),
    async (req, res, next) => {
        const credentials = await userService.rotateToken(req.user, req.decoded as { sub: string, iat: number, expiresIn: number, jti: string; }, `${req.protocol}://${req.host}`);
        return successResponse({ res, status: 201, data: { ...credentials } });
    });

router.patch(
    "/password",
    authentication(),
    validation(validators.updatePassword),
    async (req: Request, res: Response, next: NextFunction) => {
        const credentials = await userService.updatePassword(req.body, req.user, `${req.protocol}://${req.host}`);
        return successResponse({ res, data: { ...credentials } });
    });

export default router;