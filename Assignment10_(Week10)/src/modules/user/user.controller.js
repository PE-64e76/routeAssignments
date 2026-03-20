import { Router } from "express";
import { profile } from "./user.service.js";
import { successResponse } from "../../common/utils/response/success.response.js";
const router = Router();

router.get("/", (req, res, next) => {
    const result = profile(req.query.id);
    return successResponse()
})
export default router
