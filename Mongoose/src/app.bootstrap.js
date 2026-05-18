import { NODE_ENV, port } from "../config/config.service.js";
import { authenticateDB } from "./DB/connection.db.js";
import { authRouter, userRouter, notesRouter } from "./modules/index.js";
import express from "express";

async function bootstrap() {
  const app = express();
  //convert buffer data
  app.use(express.json());

  //DB
  await authenticateDB();

  //application routing
  app.get("/", (req, res) => res.send("Hello World!"));
  // Auth-related endpoints (signup/login) are reachable on /users
  app.use("/users", authRouter);
  // User profile/update/delete endpoints
  app.use("/users", userRouter);
  // Notes endpoints
  app.use("/notes", notesRouter);

  //invalid routing
  app.use("{/*dummy}", (req, res) => {
    return res.status(404).json({ message: "Invalid application routing" });
  });

  //error-handling
  app.use((error, req, res, next) => {
    const status = error.cause?.status ?? 500;
    return res.status(status).json({
      error_message:
        status == 500
          ? "something went wrong"
          : (error.message ?? "something went wrong"),
      stack: NODE_ENV == "development" ? error.stack : undefined,
    });
  });

  app.listen(port, () => console.log(`App is listening on port ${port} 🚀`));
}
export default bootstrap;
