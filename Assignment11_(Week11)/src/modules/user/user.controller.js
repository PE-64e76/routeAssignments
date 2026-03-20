import { Router } from "express";
import { profile, rotateToken } from "./user.service.js";
import { successResponse } from "../../common/utils/response/success.response.js";
import { authentication, authorization } from "../../middleware/authentication.middleware.js";
import { tokenTypeEnum } from "../../common/enums/security.enum.js";
import { endpoint } from "./user.authorization.js";
import { verifyToken } from "../../common/utils/security/token.security.js";
import { System_TOKEN_SECRET_KEY } from "../../../config/config.service.js";
const router = Router();

router.get("/", authentication(), /*authorization(endpoint.profile),*/ async (req, res, next) => {
  console.log(req.headers);







  const account = await profile(req.user);
  return successResponse({ res, data: { account } });
});

router.get("/rotate", authentication(tokenTypeEnum.refresh), async (req, res, next) => {
  const account = await rotateToken(req.user, `${req.protocol}://${req.host}`);
  return successResponse({ res, data: { account } });
});

export default router;
