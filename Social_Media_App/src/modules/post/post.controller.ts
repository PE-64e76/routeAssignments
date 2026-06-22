import { Router, type NextFunction, type Request, type Response, } from "express";
import { authentication, validation } from "../../middleware";
import { cloudFileUpload, fileFieldValidation } from "../../common/utils/multer";
import { successResponse } from "../../common/response";
import * as validators from './post.validation';
import { postService } from "./post.service";
import { PaginateDto, paginationvalidationSchema } from "../../common/validation";
import { ReactPostParamsDto, ReactPostBodyDto, UpdatePostBodyDto, UpdatePostParamsDto, DeletePostParamsDto, DeletePostQueryDto, RestorePostParamsDto, ProfilePostsParamsDto, UnreactPostParamsDto } from "./post.dto";
import { commentRouter } from "../comment";

const router = Router();
router.use('/:postId/comment', commentRouter)

router.get(
    "/",
    authentication(),
    validation(paginationvalidationSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await postService.postList(req.query as PaginateDto, req.user);
        return successResponse({ res, status: 201, data });
    }
);

router.get(
    "/feed",
    authentication(),
    validation(paginationvalidationSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await postService.postFeed(req.query as PaginateDto, req.user);
        return successResponse({ res, status: 200, data });
    }
);

router.get(
    "/profile/:userId",
    authentication(),
    validation(validators.profilePosts),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { userId } = req.params as unknown as ProfilePostsParamsDto;
        const data = await postService.profilePosts(userId, req.query as PaginateDto, req.user);
        return successResponse({ res, status: 200, data });
    }
);

router.post(
    "/",
    authentication(),
    cloudFileUpload({ validation: fileFieldValidation.image }).array("attachments", 2),
    validation(validators.createPost),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await postService.createPost({ ...req.body, files: req.files }, req.user);
        return successResponse({ res, status: 201, data });
    }
);

router.patch(
    "/:postId",
    authentication(),
    cloudFileUpload({ validation: fileFieldValidation.image }).array("attachments", 2),
    validation(validators.updatePost),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await postService.updatePost(req.params as UpdatePostParamsDto, req.body as unknown as UpdatePostBodyDto, req.user);
        return successResponse({ res, status: 201, data });
    }
);

router.patch(
    "/:postId/react",
    authentication(),
    validation(validators.reactPost),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await postService.reactPost(req.params as ReactPostParamsDto, req.body as unknown as ReactPostBodyDto, req.user);
        return successResponse({ res, status: 201, data });
    }
);

router.delete(
    "/:postId/react",
    authentication(),
    validation(validators.unreactPost),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await postService.unreactPost(req.params as UnreactPostParamsDto, req.user);
        return successResponse({ res, status: 200, data });
    }
);

router.patch(
    "/:postId/restore",
    authentication(),
    validation(validators.restorePost),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await postService.restorePost(req.params as RestorePostParamsDto, req.user);
        return successResponse({ res, status: 200, data });
    }
);

router.delete(
    "/:postId",
    authentication(),
    validation(validators.deletePost),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await postService.deletePost(req.params as DeletePostParamsDto, req.query as unknown as DeletePostQueryDto, req.user);
        return successResponse({ res, status: 200, data });
    }
);


export default router;