import { NextFunction, Request, Response, Router } from "express";
import { authentication, authorization } from "../../middleware";
import { successResponse } from "../../common/response";
import { adminService } from "./admin.service";
import { endpoint } from "./admin.authorization";

const router = Router();

router.get(
    "/dashboard",
    authentication(),
    authorization(endpoint.dashboard),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await adminService.dashboard();
        return successResponse({ res, status: 200, data });
    }
);

export default router;
