import { Router, type NextFunction, type Request, type Response, } from "express";
import { authentication, validation } from "../../middleware";
import { cloudFileUpload, fileFieldValidation } from "../../common/utils/multer";
import { successResponse } from "../../common/response";
import * as validators from './story.validation';
import { storyService } from "./story.service";
import { GetUserStoriesParamsDto, GetStoryParamsDto, ViewStoryParamsDto, DeleteStoryParamsDto } from "./story.dto";
import { IStory } from "../../common/interfaces";

const router = Router();


router.get(
    "/feed",
    authentication(),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await storyService.storyFeed(req.user);
        return successResponse<IStory[]>({ res, status: 200, data });
    }
);

router.get(
    "/user/:userId",
    authentication(),
    validation(validators.getUserStories),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await storyService.getUserStories(req.params as GetUserStoriesParamsDto, req.user);
        return successResponse<IStory[]>({ res, status: 200, data });
    }
);

router.get(
    "/:storyId",
    authentication(),
    validation(validators.getStory),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await storyService.getStory(req.params as GetStoryParamsDto, req.user);
        return successResponse<IStory>({ res, status: 200, data });
    }
);

router.post(
    "/",
    authentication(),
    cloudFileUpload({ validation: fileFieldValidation.image }).array("attachments", 2),
    validation(validators.createStory),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await storyService.createStory({ ...req.body, files: req.files }, req.user);
        return successResponse<IStory>({ res, status: 201, data });
    }
);

router.patch(
    "/:storyId/view",
    authentication(),
    validation(validators.viewStory),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await storyService.viewStory(req.params as ViewStoryParamsDto, req.user);
        return successResponse<IStory>({ res, status: 200, data });
    }
);

router.delete(
    "/:storyId",
    authentication(),
    validation(validators.deleteStory),
    async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const data = await storyService.deleteStory(req.params as DeleteStoryParamsDto, req.user);
        return successResponse({ res, status: 200, data });
    }
);


export default router;
