import { UserModel } from "../../DB/models/User.model.js";
import { asyncHandler, successResponse } from "../../utils/response.js";

export const register = asyncHandler(async (req, res) => {
  const user = await UserModel.create(req.body);
  successResponse({ res, message: "User created successfully", data: user });
});
