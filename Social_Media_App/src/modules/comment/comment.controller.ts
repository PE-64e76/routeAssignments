import { Router, type NextFunction, type Request, type Response, } from "express";
import { authentication, validation } from "../../middleware";
import { cloudFileUpload, fileFieldValidation } from "../../common/utils/multer";
import { successResponse } from "../../common/response";
import * as validators from './comment.validation';
import { commentService } from "./comment.service";
import { CreateCommentParamsDto, CreateReplayOnCommentParamsDto, CommentListParamsDto, CommentListQueryDto, GetCommentParamsDto, UpdateCommentParamsDto, UpdateCommentBodyDto, DeleteCommentParamsDto, DeleteCommentQueryDto, RestoreCommentParamsDto, ReactCommentParamsDto, ReactCommentBodyDto, UnreactCommentParamsDto } from "./comment.dto";
import { IComment } from "../../common/interfaces";

const router = Router({ mergeParams: true });



router.get(
    "/",
    authentication(),
    validation(validators.commentList),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await commentService.commentList(req.params as CommentListParamsDto, req.query as unknown as CommentListQueryDto, req.user);
        return successResponse({ res, status: 200, data });
    }
);

router.get(
    "/:commentId",
    authentication(),
    validation(validators.getComment),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await commentService.getComment(req.params as GetCommentParamsDto, req.user);
        return successResponse<IComment>({ res, status: 200, data });
    }
);

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
    "/:commentId/replay",
    authentication(),
    cloudFileUpload({ validation: fileFieldValidation.image }).array("attachments", 2),
    validation(validators.replayOnComment),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await commentService.replayOnComment(req.params as CreateReplayOnCommentParamsDto, { ...req.body, files: req.files }, req.user);
        return successResponse<IComment>({ res, status: 201, data });
    }
);

router.patch(
    "/:commentId",
    authentication(),
    cloudFileUpload({ validation: fileFieldValidation.image }).array("attachments", 2),
    validation(validators.updateComment),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await commentService.updateComment(req.params as UpdateCommentParamsDto, req.body as unknown as UpdateCommentBodyDto, req.user);
        return successResponse<IComment>({ res, status: 201, data });
    }
);

router.patch(
    "/:commentId/restore",
    authentication(),
    validation(validators.restoreComment),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await commentService.restoreComment(req.params as RestoreCommentParamsDto, req.user);
        return successResponse<IComment>({ res, status: 200, data });
    }
);

router.patch(
    "/:commentId/react",
    authentication(),
    validation(validators.reactComment),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await commentService.reactComment(req.params as ReactCommentParamsDto, req.body as unknown as ReactCommentBodyDto, req.user);
        return successResponse<IComment>({ res, status: 200, data });
    }
);

router.delete(
    "/:commentId/react",
    authentication(),
    validation(validators.unreactComment),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await commentService.unreactComment(req.params as UnreactCommentParamsDto, req.user);
        return successResponse<IComment>({ res, status: 200, data });
    }
);

router.delete(
    "/:commentId",
    authentication(),
    validation(validators.deleteComment),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await commentService.deleteComment(req.params as DeleteCommentParamsDto, req.query as unknown as DeleteCommentQueryDto, req.user);
        return successResponse({ res, status: 200, data });
    }
);



export default router;