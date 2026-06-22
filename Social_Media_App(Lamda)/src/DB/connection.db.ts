import { connect } from "mongoose";
import { DB_URI } from "../config/config.service";
// import { UserModel } from "./model";

export const connectDB = async () => {
    try {
        await connect(DB_URI as string, {
            serverSelectionTimeoutMS: 30000
        })
        // await UserModel.syncIndexes()
        console.log(`DB connected successfully 📊`);
        
    } catch (error) {
        console.log(`Fail to connect to database ${error} 😤`);
    }
};