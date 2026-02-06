import { NODE_ENV, port } from "../config/config.service.js";
import { checkDBConnection } from "./DB/connection.db.js";
import { syncModels } from "./DB/model/index.js";
import { authRouter, userRouter, postRouter, commentRouter } from "./modules/index.js";
import express from "express";

async function bootstrap() {
  const app = express();
  
  // Convert buffer data
  app.use(express.json());

  // DB Connection
  await checkDBConnection();
  
  // Sync Models
  await syncModels();

  // Application routing
  app.use("/auth", authRouter);
  app.use("/users", userRouter);
  app.use("/user", userRouter); 
  app.use("/posts", postRouter);
  app.use("/comments", commentRouter);

  // Invalid routing
  app.use((req, res) => {
    return res.status(404).json({ message: "Invalid application routing" });
  });

  // Error-handling
  app.use((error, req, res, next) => {
    const status = error.cause?.status ?? 500;
    return res.status(status).json({
      error_message:
        status == 500
          ? "something went wrong"
          : error.message ?? "something went wrong",
      stack: NODE_ENV == "development" ? error.stack : undefined,
    });
  });

  app.listen(port, () => console.log(`Server is running on port ${port} 🚀`));
}

export default bootstrap;
