import { MongoClient } from "mongodb";
import { DB_URI } from "../../config/config.service.js";
const client = new MongoClient(DB_URI, { serverSelectionTimeoutMS: 5000 });

export const connectDB = async () => {
  try {
    await client.connect();
    console.log(`DB connected successfully ✅`);
  } catch (error) {
    console.log(`Fial to connect ... ${error} ❌`);
  }
};

export { client };
