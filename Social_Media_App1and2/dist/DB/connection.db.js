"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = require("mongoose");
const config_service_1 = require("../config/config.service");
const connectDB = async () => {
    try {
        await (0, mongoose_1.connect)(config_service_1.DB_URI, {
            serverSelectionTimeoutMS: 30000
        });
        console.log(`DB connected successfully 📊`);
    }
    catch (error) {
        console.log(`Fail to connect to database ${error} 😤`);
    }
};
exports.connectDB = connectDB;
