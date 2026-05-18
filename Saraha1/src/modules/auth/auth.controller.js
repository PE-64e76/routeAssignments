import { Router } from "express";
import { login, signup, verifyOTP, encryptDataAsymmetric, decryptDataAsymmetric } from "./auth.service.js";
import { successResponse } from "../../common/utils/response/success.response.js";
const router = Router();

router.post("/signup",async (req, res, next) =>{
    const account = await signup(req.body);
    return successResponse({res, status:201, data:{account}})
})

router.post("/verify-otp",async (req, res, next) =>{
    const result = await verifyOTP(req.body);
    return successResponse({res, data:{result}})
})

router.post("/login",async (req, res, next) =>{
    const account = await login(req.body);
    return successResponse({res, data:{account}})
})

router.post("/encrypt-asymmetric",async (req, res, next) =>{
    const result = await encryptDataAsymmetric(req.body);
    return successResponse({res, data:{result}})
})

router.post("/decrypt-asymmetric",async (req, res, next) =>{
    const result = await decryptDataAsymmetric(req.body);
    return successResponse({res, data:{result}})
})

export default router