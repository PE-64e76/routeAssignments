import { Router, type NextFunction, type Request, type Response, } from "express";
import { authentication, validation } from "../../middleware";
import { cloudFileUpload, fileFieldValidation } from "../../common/utils/multer";
import { successResponse } from "../../common/response";
import * as validators from './comment.validation';
import { commentService } from "./comment.service";
import { CreateCommentParamsDto, CreateReplayOnCommentParamsDto } from "./comment.dto";
import { IComment } from "../../common/interfaces";

const router = Router({ mergeParams: true });



router.post(
    "/",
    authentication(),
    cloudFileUpload({ validation: fileFieldValidation.image }).array("attachments", 2),
    validation(validators.createComment),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await commentService.createComment(req.params as CreateCommentParamsDto, { ...req.body, files: req.files }, req.user);
        return successResponse<IComment>({ res, status: 201, data });
    }
);

router.post(
    "/commentId/replay",
    authentication(),
    cloudFileUpload({ validation: fileFieldValidation.image }).array("attachments", 2),
    validation(validators.replayOnComment),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await commentService.replayOnComment(req.params as CreateReplayOnCommentParamsDto, { ...req.body, files: req.files }, req.user);
        return successResponse<IComment>({ res, status: 201, data });
    }
);



export default router;