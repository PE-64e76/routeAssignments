import type { Express, NextFunction, Request, Response } from "express";
import express from "express";
import { authRouter, userRouter } from "./modules";
import cors from "cors";
import { globalErrorHandler } from "./middleware";
import { connectDB } from "./DB/connection.db";
import { PORT } from "./config/config.service";
import { redisService } from "./common/services";


export const bootstrap = async (): Promise<void> => {
    const app: Express = express();

    // Global middleware
    app.use(cors(), express.json());

    // Base routing
    app.get("/", (req: Request, res: Response, next: NextFunction) => {
        res.send("Hello World");
    });

    // App routing
    app.use("/auth", authRouter);
    app.use("/user", userRouter);

    // Invalid routing
    app.use('/*dummy', (req: Request, res: Response, next: NextFunction) => {
        res.status(404).json({ message: "Not Found" });
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