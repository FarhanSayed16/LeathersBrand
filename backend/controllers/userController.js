import validator from "validator";
import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/mailer.js";
import otpModel from "../models/otpModel.js";
import brand from "../../shared/brand.config.js";

const MIN_PASSWORD_LENGTH = 8;

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const allowDevOtpBypass = () =>
  process.env.ALLOW_DEV_OTP === "true" && process.env.NODE_ENV !== "production";

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const validatePassword = (password) => {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
};

// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { role: "admin", email: process.env.ADMIN_EMAIL },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      res.json({
        success: true,
        token,
        message: "Logged In Successful Admin",
      });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const sendOtpEmail = async (email, otp) => {
  await sendEmail({
    to: email,
    subject: brand.email?.verifyEmailSubject || `Verify Your Email — ${brand.name}`,
    html: `
      <h2>Email Verification</h2>
      <p>Your one-time verification code:</p>
      <h1 style="letter-spacing:4px">${otp}</h1>
      <p>This code is valid for <strong>10 minutes</strong>.</p>
      <p>If you did not create a ${brand.name} account, you can ignore this email.</p>
    `,
  });
};

const persistPendingRegistration = async ({
  email,
  otp,
  firstName,
  lastName,
  phone,
  hashedPassword,
}) => {
  await otpModel.deleteOne({ email });
  await otpModel.create({
    email,
    otp,
    userData: {
      firstName,
      lastName,
      phone,
      password: hashedPassword,
    },
  });
};

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword } =
      req.body;

    const cleanEmail = normalizeEmail(email);

    if (!firstName?.trim() || !lastName?.trim() || !phone?.trim()) {
      return res.json({ success: false, message: "All fields are required" });
    }

    if (!cleanEmail || !validator.isEmail(cleanEmail)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }

    if (password !== confirmPassword) {
      return res.json({ success: false, message: "Passwords do not match" });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.json({ success: false, message: passwordError });
    }

    const exists = await userModel.findOne({ email: cleanEmail });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    await persistPendingRegistration({
      email: cleanEmail,
      otp,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      hashedPassword,
    });

    try {
      await sendOtpEmail(cleanEmail, otp);
      console.log(`[MAIL SUCCESS] OTP sent to ${cleanEmail}`);
      return res.json({
        success: true,
        message: "OTP sent successfully to your email!",
      });
    } catch (mailError) {
      console.error(
        `[MAIL ERROR] Failed to send OTP to ${cleanEmail}:`,
        mailError.message
      );

      if (allowDevOtpBypass()) {
        await otpModel.updateOne({ email: cleanEmail }, { $set: { otp: "123456" } });
        console.log(`[DEV OTP BYPASS] OTP set to 123456 for ${cleanEmail}`);
        return res.json({
          success: true,
          message:
            "Email failed (dev mode). Use OTP 123456. Do not enable this in production.",
        });
      }

      await otpModel.deleteOne({ email: cleanEmail });
      return res.json({
        success: false,
        message:
          "Could not send verification email. Please try again later or contact support.",
      });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/** Resend OTP for an in-progress registration (pending otp record). */
export const resendOtp = async (req, res) => {
  try {
    const cleanEmail = normalizeEmail(req.body.email);

    if (!cleanEmail || !validator.isEmail(cleanEmail)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }

    const pending = await otpModel.findOne({ email: cleanEmail });
    if (!pending) {
      return res.json({
        success: false,
        message: "No pending registration found. Please register again.",
      });
    }

    const exists = await userModel.findOne({ email: cleanEmail });
    if (exists) {
      await otpModel.deleteOne({ email: cleanEmail });
      return res.json({
        success: false,
        message: "Account already verified. Please log in.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    pending.otp = otp;
    pending.createdAt = new Date();
    await pending.save();

    try {
      await sendOtpEmail(cleanEmail, otp);
      console.log(`[MAIL SUCCESS] OTP resent to ${cleanEmail}`);
      return res.json({
        success: true,
        message: "A new OTP has been sent to your email.",
      });
    } catch (mailError) {
      console.error(
        `[MAIL ERROR] Failed to resend OTP to ${cleanEmail}:`,
        mailError.message
      );

      if (allowDevOtpBypass()) {
        pending.otp = "123456";
        await pending.save();
        return res.json({
          success: true,
          message:
            "Email failed (dev mode). Use OTP 123456. Do not enable this in production.",
        });
      }

      return res.json({
        success: false,
        message:
          "Could not send verification email. Please try again later or contact support.",
      });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const cleanEmail = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();

    if (!cleanEmail || !otp) {
      return res.json({ success: false, message: "Email and OTP are required" });
    }

    const tempUser = await otpModel.findOne({ email: cleanEmail });

    if (!tempUser) {
      return res.json({
        success: false,
        message: "No registration found or OTP expired",
      });
    }

    if (tempUser.otp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const existing = await userModel.findOne({ email: cleanEmail });
    if (existing) {
      await otpModel.deleteOne({ email: cleanEmail });
      return res.json({
        success: false,
        message: "User already exists. Please log in.",
      });
    }

    const user = await userModel.create({
      email: tempUser.email,
      firstName: tempUser.userData.firstName,
      lastName: tempUser.userData.lastName,
      phone: tempUser.userData.phone,
      password: tempUser.userData.password,
      isVerified: true,
    });

    await otpModel.deleteOne({ email: cleanEmail });

    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      message: "Email verified successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const cleanEmail = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!cleanEmail || !password) {
      return res.json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userModel.findOne({ email: cleanEmail });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res.json({
        success: false,
        message: "Please verify email first",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      message: "Login successful",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  const cleanEmail = normalizeEmail(req.body.email);

  try {
    if (!cleanEmail || !validator.isEmail(cleanEmail)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }

    const user = await userModel.findOne({ email: cleanEmail });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!process.env.FRONTEND_URL) {
      return res.json({
        success: false,
        message: "Server misconfigured: FRONTEND_URL is missing",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    // 60 minutes — enough time to open the email and complete the form
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL.replace(/\/$/, "")}/reset-password/${token}`;

    try {
      await sendEmail({
        to: cleanEmail,
        subject: brand.email?.resetPasswordSubject || `Reset Password — ${brand.name}`,
        html: `
          <h2>Password Reset</h2>
          <p>Click the link below to set a new password:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>This link is valid for <strong>60 minutes</strong>.</p>
          <p>If you did not request this, you can ignore this email.</p>
        `,
      });
    } catch (mailError) {
      console.error(`[MAIL ERROR] Forgot password:`, mailError.message);
      return res.json({
        success: false,
        message:
          "Could not send reset email. Please try again later or contact support.",
      });
    }

    res.json({ success: true, message: "Reset email sent" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.json({ success: false, message: passwordError });
    }

    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.json({
        success: false,
        message: "Admin access only",
      });
    }

    const users = await userModel
      .find()
      .select("_id firstName lastName email phone createdAt isVerified");

    res.json({ success: true, users });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.userId)
      .select(
        "-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires"
      );

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export { adminLogin };
