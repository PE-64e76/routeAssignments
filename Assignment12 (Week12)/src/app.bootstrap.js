import { port } from '../config/config.service.js'
import { connectDB } from './DB/index.js';
import { globalErrorHandling } from './common/utils/response/error.response.js';
import { authRouter, userRouter } from './modules/index.js'
import express from "express";
import cors from 'cors'

async function bootstrap() {
  const app = express();

  app.use(cors(), express.json());

  await connectDB()

  app.use("/auth", authRouter)
  app.use('/user', userRouter)

  app.use("{/*dummy}", (req, res) => {
    return res.status(404).json({ message: "Invalid application routing" });
  });

  app.use(globalErrorHandling)

  app.listen(port, () => console.log(`Server is running on port ${port} 🚀`))
}
export default bootstrap
