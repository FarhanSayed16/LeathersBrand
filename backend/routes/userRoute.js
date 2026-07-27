import express from "express";
import {
  registerUser,
  resendOtp,
  verifyOtp,
  loginUser,
  forgotPassword,
  resetPassword,
  getAllUsers,
  adminLogin,
  getUserProfile,
} from "../controllers/userController.js";

import authUser from "../middleware/auth.js";
import rateLimit from "express-rate-limit";

const userRouter = express.Router();

const jsonTooMany = {
  success: false,
  message:
    "Too many authentication attempts from this IP. Please try again after 15 minutes.",
};

/** Stricter for register / resend / forgot (email-sending) */
const sendMailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonTooMany,
});

/** Looser for login + OTP verify (users mistype codes) */
const authAttemptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonTooMany,
});

/* =========================
   AUTH & REGISTRATION
========================= */

userRouter.post("/admin", adminLogin);

userRouter.post("/register", sendMailLimiter, registerUser);
userRouter.post("/resend-otp", sendMailLimiter, resendOtp);
userRouter.post("/verify-otp", authAttemptLimiter, verifyOtp);
userRouter.post("/login", authAttemptLimiter, loginUser);

/* =========================
   PASSWORD RESET
========================= */

userRouter.post("/forgot-password", sendMailLimiter, forgotPassword);
userRouter.post("/reset-password", authAttemptLimiter, resetPassword);

/* =========================
   USER PROFILE (PROTECTED)
========================= */

userRouter.get("/profile", authUser, getUserProfile);
userRouter.get("/all", authUser, getAllUsers);

export default userRouter;
