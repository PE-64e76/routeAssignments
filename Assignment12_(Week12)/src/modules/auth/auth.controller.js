import { Router } from "express";
import { login, signup, signupWithGmail, loginWithGmail } from "./auth.service.js";
import * as validators from './auth.validation.js'
import { BadRequestException } from "../../common/utils/response/error.response.js";
import { successResponse } from "../../common/utils/response/success.response.js";
import { validation } from "../../middleware/validation.middleware.js";
const router = Router();

router.post("/signup", validation(validators.signup), async (req, res, next) => {
  const account = await signup(req.body);
  return successResponse({ res, status: 201, data: { account } });
});

router.post("/login", validation(validators.login), async (req, res, next) => {
  const account = await login(req.body, `${req.protocol}://${req.host}`);
  return successResponse({ res, data: { account } });
});

router.post("/signup/gmail", async (req, res, next) => {
  const { account, status = 201 } = await signupWithGmail(req.body, `${req.protocol}://${req.host}`);
  return successResponse({ res, status, data: { account } });
});

router.post("/login/gmail", async (req, res, next) => {
  const account = await loginWithGmail(req.body, `${req.protocol}://${req.host}`);
  return successResponse({ res, data: { account } });
});

export default router;
