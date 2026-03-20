import {NODE_ENV, port} from '../config/config.service.js'
import { connectDB } from './DB/index.js';
import { globalErrorHandling } from './common/utils/response/error.response.js';
import {authRouter, userRouter} from './modules/index.js'
import express from "express";
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function bootstrap() {
  const app = express();

  // Convert buffer data
  app.use(cors(),express.json());

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

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
