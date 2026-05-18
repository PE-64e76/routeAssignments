"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const express_1 = __importDefault(require("express"));
const modules_1 = require("./modules");
const cors_1 = __importDefault(require("cors"));
const middleware_1 = require("./middleware");
const connection_db_1 = require("./DB/connection.db");
const config_service_1 = require("./config/config.service");
const services_1 = require("./common/services");
const bootstrap = async () => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)(), express_1.default.json());
    app.get("/", (req, res, next) => {
        res.send("Hello World");
    });
    app.use("/auth", modules_1.authRouter);
    app.use("/user", modules_1.userRouter);
    app.use('/*dummy', (req, res, next) => {
        res.status(404).json({ message: "Not Found" });
    });
    app.use(middleware_1.globalErrorHandler);
    await (0, connection_db_1.connectDB)();
    await services_1.redisService.connect();
    app.listen(config_service_1.PORT, () => {
        console.log(`Server is running on port ${config_service_1.PORT} 🚀`);
    });
};
exports.bootstrap = bootstrap;
