import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";

export const authenticateDB = async () => {
  try {
    await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`DB connected successfully ✅`);
  } catch (error) {
    console.log(`Fail to connect on DB ${error} ❌`);
  }
};
