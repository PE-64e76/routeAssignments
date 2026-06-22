import { config } from "dotenv";
config();
import { MongoClient, ObjectId } from "mongodb";

const MONGO_URI = process.env.DB_URI;
const DB_NAME = process.env.DB_NAME;

let client;

const connectDB = async () => {
    if (!client) {
        client = new MongoClient(MONGO_URI);
        await client.connect();
    }
    return client;
};

export const handler = async (event) => {
    const client = await connectDB();
    const db = client.db(DB_NAME);
    const users = db.collection("SOCIAL_APP_Users");

    for (const record of event.Records) {
        try {
            let fullKey = decodeURIComponent(
                record.s3.object.key.replace(/\+/g, " ")
            );

            console.log("S3 key:", fullKey);

            const parts = fullKey.split("/");

            /*
              BSA_PROJECT / Request / customId / projectAttachments / file.jpg
            */

            const customId = parts[2];

            if (!customId) {
                console.log("Invalid key format:", fullKey);
                continue;
            }
            console.log({ fullKey });

            const result = await users.updateOne(
                { _id: new ObjectId(customId) },
                {
                    $set: {
                        profilePicture: fullKey,
                        updatedAt: new Date(),
                    },
                },
            );

            console.log({
                customId,
                matched: result.matchedCount,
                modified: result.modifiedCount,
            });

        } catch (error) {
            console.error("Lambda error for record:", error);
        }
    }

    return { statusCode: 200 };
};

