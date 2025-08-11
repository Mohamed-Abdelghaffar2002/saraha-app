import Router from "express";
import * as authServices from "./auth.service.js";
const router = Router();
router.post("/signup", authServices.signup);
router.post("/verify-account", authServices.verifyEmail);
router.post("/resend-otp", authServices.resendOtp);
router.post("/login", authServices.login);

export default router;
