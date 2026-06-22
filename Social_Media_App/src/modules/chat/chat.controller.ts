
import { NextFunction, Request, Response, Router } from 'express';
import { authentication } from '../../middleware';
import { successResponse } from '../../common/response';
import { chatService } from './chat.service';
import { cloudFileUpload, fileFieldValidation } from '../../common/utils/multer';

const router = Router({ mergeParams: true });

router.get(
    "/",
    authentication(),
    async (req: Request, res: Response, next: NextFunction)=>{
        
        const chat = await chatService.getChat(req.params.userId as string ,req.query as unknown as {page?:string, size?:string}, req.user);
        return successResponse({res, data:{chat}})
    }
)

router.get(
    "/group/:groupId",
    authentication(),
    async (req: Request, res: Response, next: NextFunction)=>{
        
        const chat = await chatService.getGroupChat(req.params.userId as string ,req.query as unknown as {page?:string, size?:string}, req.user);
        return successResponse({res, data:{chat}})
    }
)

router.post(
    "/group",
    authentication(),
    cloudFileUpload({validation:fileFieldValidation.image}).single("attachment"),
    async (req: Request, res: Response, next: NextFunction)=>{
        
        const chat = await chatService.createGroup(req.body, req.user, req.file as Express.Multer.File);
        return successResponse({res, data:{chat}})
    }
)

// ─── Attachments ─────────────────────────────────────────────────────────────

router.post(
    "/attachments",
    authentication(),
    cloudFileUpload({validation: fileFieldValidation.attachment, maxSize: 10}).array("attachments", 5),
    async (req: Request, res: Response, next: NextFunction)=>{
        const content = req.body.content as string | undefined;
        const sendTo = req.body.sendTo as string;
        const payload = content !== undefined ? { content, sendTo } : { sendTo };
        await chatService.sendMessageWithAttachments(payload, req.user, req.files as Express.Multer.File[]);
        return successResponse({res, data:{ message: "Attachments sent successfully" }})
    }
)

router.post(
    "/group/:groupId/attachments",
    authentication(),
    cloudFileUpload({validation: fileFieldValidation.attachment, maxSize: 10}).array("attachments", 5),
    async (req: Request, res: Response, next: NextFunction)=>{
        const content = req.body.content as string | undefined;
        const groupId = req.params.groupId as string;
        const payload = content !== undefined ? { content, groupId } : { groupId };
        await chatService.sendGroupMessageWithAttachments(payload, req.user, req.files as Express.Multer.File[]);
        return successResponse({res, data:{ message: "Attachments sent successfully" }})
    }
)

export default router;
