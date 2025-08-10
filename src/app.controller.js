import express from "express";
import connectDB from "./DB/models/connection.db.js";
import authController from "./modules/auth/auth.controller.js";
import { globalErrorHandler } from "./utils/response.js";
const bootstrap = () => {
  const app = express();
  const port = 3000;
  //DB
  connectDB();

  app.use(express.json());

  app.use("/auth", authController);

  app.all("{/*dummy}", (req, res, next) => {
    next(new Error("In-valid router.", { cause: 404 }));
  });
  app.use(globalErrorHandler);

  app.listen(port, () => {
    console.log(`Server is running on port ${port}🚀`);
  });
};

export default bootstrap;
