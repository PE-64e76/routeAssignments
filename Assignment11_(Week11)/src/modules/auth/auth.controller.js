import { Router } from "express";
import { login, signup, signupWithGmail, verifyEmail, resendOTP } from "./auth.service.js";
import { successResponse } from "../../common/utils/response/success.response.js";
import { uploadToCloud, allowedFileTypesEnum } from "../../common/utils/multer/index.js";
const router = Router();

router.post("/signup", uploadToCloud({ allowedTypes: allowedFileTypesEnum.Image }).single("profilePic"), async (req, res, next) => {
  if (req.file) {
    req.body.profilePic = req.file.path;
  }
  const account = await signup(req.body);
  return successResponse({ res, status: 201, data: { account } });
});

router.post("/verify-email", async (req, res, next) => {
  await verifyEmail(req.body);
  return successResponse({ res, message: "Email verified successfully" });
});

router.post("/resend-otp", async (req, res, next) => {
  await resendOTP(req.body);
  return successResponse({ res, message: "OTP sent successfully, valid for 5 minutes" });
});

router.post("/login", async (req, res, next) => {
  console.log(`${req.protocol}://${req.host}`);
  const account = await login(req.body, `${req.protocol}://${req.host}`);
  return successResponse({ res, data: { account } });
});

router.post("/signup/gmail", async (req, res, next) => {
  console.log(req.body);
  const { account, status = 201 } = await signupWithGmail(req.body, `${req.protocol}://${req.host}`)
  return successResponse({ res, status, data: { account } });
});

router.post("/login/gmail", async (req, res, next) => {
  console.log(req.body);
  const account = await loginWithGmail(req.body, `${req.protocol}://${req.host}`)
  return successResponse({ res, data: { account } });
});

export default router;
