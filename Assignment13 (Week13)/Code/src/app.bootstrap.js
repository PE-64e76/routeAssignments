import { port } from '../config/config.service.js'
import { connectDB, redisConnection } from './DB/index.js';
import { globalErrorHandling } from './common/utils/response/error.response.js';
import { authRouter, userRouter } from './modules/index.js'
import express from "express";
import cors from 'cors'
import { resolve } from 'path';

async function bootstrap() {
  const app = express();

  // Convert buffer data
  app.use(cors(), express.json());
  app.use("/uploads", express.static(resolve("../uploads")))

  // DB
  await connectDB()
  await redisConnection()
  

  // Application routing
  app.use("/auth", authRouter)
  app.use('/user', userRouter)

  // Invalid routing 
  app.use("{/*dummy}", (req, res) => {
    return res.status(404).json({ message: "Invalid application routing" });
  });

  // Error-handling
  app.use(globalErrorHandling)

  app.listen(port, () => console.log(`Server is running on port ${port} 🚀`))
}
export default bootstrap
