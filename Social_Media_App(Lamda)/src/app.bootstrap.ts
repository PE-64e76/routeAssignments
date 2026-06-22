import type { Express } from "express";
import express from "express";
import { authRouter, postRouter, userRouter } from "./modules";
import cors from "cors";
import { globalErrorHandler } from "./middleware";
import { connectDB } from "./DB/connection.db";
import { PORT } from "./config/config.service";
import { redisService, s3Service } from "./common/services";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { successResponse } from "./common/response";

const s3WriteStream = promisify(pipeline);
export const bootstrap = async (): Promise<void> => {
    const app: Express = express();

    // Global middleware
    app.use(cors(), express.json());

    // Base routing
    app.get("/", (req: express.Request, res: express.Response, next: express.NextFunction): express.Response => {
        return res.status(200).json({ message: "Landing Page" });
    });


    // app.post("/send-notification", async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> => {
    //     console.log({token:req.body.token});
    //     await notificationService.sendNotification({
    //         token:req.body.token,
    //         data:{
    //             title:"First-Time",
    //             body:"Hello World"
    //         }
    //     })
    //     return res.status(200).json({ message: "Landing Page" });
    // });

    // App routing
    app.use("/auth", authRouter);
    app.use("/user", userRouter);
    app.use("/post", postRouter);

    app.get("/uploads/*path", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const { download, fileName } = req.query as { download: string, fileName: string; };
        const { path } = req.params as { path: string[]; };
        const Key = path.join("/");
        const { Body, ContentType } = await s3Service.getAsset({ Key });
        console.log({ Body, ContentType });
        res.setHeader(
            "Content-Type",
            ContentType || "application/octet-stream"
        );
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        if (download === "true") {
            res.setHeader("Content-Disposition", `attachment; fileName= "${fileName || Key.split("/").pop()}"`);
        }
        return await s3WriteStream(Body as NodeJS.ReadableStream, res);
    });

    app.get("/pre-signed/*path", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const { download, fileName } = req.query as { download: string, fileName: string; };
        const { path } = req.params as { path: string[]; };
        const Key = path.join("/");
        const url = await s3Service.createPreSignedFetchLink({ Key, download, fileName });
        return successResponse({ res, data: { url } });
    });

    // Invalid routing
    app.use('/*dummy', (req: express.Request, res: express.Response, next: express.NextFunction): express.Response => {
        return res.status(404).json({ message: "Invalid application Routing" });
    });

    // Global error handling
    app.use(globalErrorHandler);

    // DB
    await connectDB();

    // Redis
    await redisService.connect();


    // App deploy
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} 🚀`);
    });
};