import { Router } from "express";
import * as userServices from "./user.service.js";
import { asyncHandler } from "../../utils/response/index.js";
const router = Router();
router.get("/", asyncHandler(userServices.getUser));
router.delete("/", asyncHandler(userServices.deleteUser));
export default router;
