import express from "express";
import connectDB from "./DB/models/connection.db.js";
import authController from "./modules/auth/auth.controller.js";
import userController from "./modules/user/user.controller.js";
import { globalErrorHandler } from "./utils/response/index.js";
import cors from "cors";
const bootstrap = () => {
  const app = express();
  const port = 3000;
  //DB
  connectDB();
  app.use(cors({ origin: "*" }));
  app.use(express.json());

  app.use("/auth", authController);
  app.use("/user", userController);

  app.all("{/*dummy}", (req, res, next) => {
    next(new Error("In-valid router.", { cause: 404 }));
  });
  app.use(globalErrorHandler);

  app.listen(port, () => {
    console.log(`Server is running on port ${port}🚀`);
  });
};

export default bootstrap;
