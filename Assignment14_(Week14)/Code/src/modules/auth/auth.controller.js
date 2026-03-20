import { Router } from "express";
import { login, signup, signupWithGmail, loginWithGmail, confirmEmail, reSendConfirmEmail, loginConfirmation, enableTwoStepVerification, verifyTwoStepVerification, updatePassword, forgetPassword, resetPassword } from "./auth.service.js";
import * as validators from './auth.validation.js'
import { successResponse } from "../../common/utils/response/success.response.js";
import { validation } from "../../middleware/validation.middleware.js";
import { authentication } from "../../middleware/authentication.middleware.js";
const router = Router();

router.post("/signup", validation(validators.signup), async (req, res, next) => {
  const account = await signup(req.body);
  return successResponse({ res, status: 201, data: { account } });
});

router.patch("/confirm-email", validation(validators.confirmEmail), async (req, res, next) => {
  const account = await confirmEmail(req.body);
  return successResponse({ res });
});

router.patch("/resend-confirm-email", validation(validators.reSendConfirmEmail), async (req, res, next) => {
  const account = await reSendConfirmEmail(req.body);
  return successResponse({ res });
});

router.post("/login", validation(validators.login), async (req, res, next) => {
  const account = await login(req.body, `${req.protocol}://${req.host}`);
  return successResponse({ res, data: { account } });
});

router.post("/login/confirm", validation(validators.loginConfirmation), async (req, res, next) => {
  const account = await loginConfirmation(req.body, `${req.protocol}://${req.host}`);
  return successResponse({ res, data: { account } });
});

router.post("/2step-verification/enable", authentication(), async (req, res, next) => {
  const account = await enableTwoStepVerification(req.user);
  return successResponse({ res });
});

router.patch("/2step-verification/verify", authentication(), validation(validators.verifyTwoStepVerification), async (req, res, next) => {
  const account = await verifyTwoStepVerification(req.body, req.user);
  return successResponse({ res });
});

router.patch("/password", authentication(), validation(validators.updatePassword), async (req, res, next) => {
  const account = await updatePassword(req.body, req.user);
  return successResponse({ res });
});

router.post("/forget-password", validation(validators.forgetPassword), async (req, res, next) => {
  const account = await forgetPassword(req.body);
  return successResponse({ res });
});

router.patch("/reset-password", validation(validators.resetPassword), async (req, res, next) => {
  const account = await resetPassword(req.body);
  return successResponse({ res });
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
