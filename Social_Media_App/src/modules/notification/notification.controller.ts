import { Router, type NextFunction, type Request, type Response, } from "express";
import { authentication, authorization, validation } from "../../middleware";
import { successResponse } from "../../common/response";
import * as validators from './notification.validation';
import { notificationServiceInstance as notificationService } from "./notification.service";
import { endpoint } from "./notification.authorization";
import { CreateNotificationBodyDto, NotificationListQueryDto, GetNotificationParamsDto, MarkAsReadParamsDto, UpdateNotificationParamsDto, UpdateNotificationBodyDto, DeleteNotificationParamsDto, DeleteNotificationQueryDto, RestoreNotificationParamsDto } from "./notification.dto";
import { INotification } from "../../common/interfaces";

const router = Router();


router.get(
    "/",
    authentication(),
    validation(validators.notificationList),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await notificationService.notificationList(req.query as unknown as NotificationListQueryDto, req.user);
        return successResponse({ res, status: 200, data });
    }
);

router.get(
    "/:notificationId",
    authentication(),
    validation(validators.getNotification),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await notificationService.getNotification(req.params as GetNotificationParamsDto, req.user);
        return successResponse<INotification>({ res, status: 200, data });
    }
);

router.post(
    "/",
    authentication(),
    authorization(endpoint.create),
    validation(validators.createNotification),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await notificationService.createNotification(req.body as CreateNotificationBodyDto, req.user);
        return successResponse<INotification>({ res, status: 201, data });
    }
);

router.patch(
    "/:notificationId/read",
    authentication(),
    validation(validators.markAsRead),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await notificationService.markAsRead(req.params as MarkAsReadParamsDto, req.user);
        return successResponse<INotification>({ res, status: 200, data });
    }
);

router.patch(
    "/:notificationId",
    authentication(),
    authorization(endpoint.manageAny),
    validation(validators.updateNotification),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await notificationService.updateNotification(req.params as UpdateNotificationParamsDto, req.body as UpdateNotificationBodyDto, req.user);
        return successResponse<INotification>({ res, status: 200, data });
    }
);

router.patch(
    "/:notificationId/restore",
    authentication(),
    authorization(endpoint.manageAny),
    validation(validators.restoreNotification),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await notificationService.restoreNotification(req.params as RestoreNotificationParamsDto);
        return successResponse<INotification>({ res, status: 200, data });
    }
);

router.delete(
    "/:notificationId",
    authentication(),
    authorization(endpoint.manageAny),
    validation(validators.deleteNotification),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await notificationService.deleteNotification(req.params as DeleteNotificationParamsDto, req.query as unknown as DeleteNotificationQueryDto);
        return successResponse({ res, status: 200, data });
    }
);


export default router;
