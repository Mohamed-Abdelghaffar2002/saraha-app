import { UserModel } from "../../DB/models/User.model.js";
import { successResponse } from "../../utils/response/index.js";
import { verifyToken } from "../../utils/token/index.js";

export const getUser = async (req, res) => {
  const token = req.headers.authorization;
  const data = verifyToken(token);
  const user = await UserModel.findById(data.id);
  if (!user) {
    throw new Error("User not found", { cause: 404 });
  }
  successResponse({ res, message: "User found successfully", data: user });
};

export const deleteUser = async (req, res) => {
  const token = req.headers.authorization;
  const data = verifyToken(token);
  const user = await UserModel.findByIdAndDelete(data.id);
  if (!user) {
    throw new Error("User not found", { cause: 404 });
  }
  successResponse({ res, message: "User deleted successfully", status: 200 });
};
