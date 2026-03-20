import {NODE_ENV, port} from '../config/config.service.js'
import { connectDB } from './DB/index.js';
import { globalErrorHandling } from './common/utils/response/error.response.js';
import {authRouter, userRouter} from './modules/index.js'
import express from "express";


async function bootstrap() {
  const app = express();

  // Convert buffer data
  app.use(express.json());

  // DB
  await connectDB()

  // Application routing
  app.use("/auth", authRouter)
  app.use('/user', userRouter)

  // Invalid routing
  app.use("{/*dummy}", (req, res) => {
    return res.status(404).json({ message: "Invalid application routing" });
  });

  // Error handling
    app.use(globalErrorHandling)
    
    app.listen(port, () => console.log(`Server is running on port ${port} 🚀`))
}
export default bootstrap
