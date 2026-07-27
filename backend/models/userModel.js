import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,

  isVerified: { type: Boolean, default: false },

  otp: String,
  otpExpires: Date,

  resetPasswordToken: String,
  resetPasswordExpires: Date,

  wishlist: { type: [String], default: [] },

  // ✅ ADD THIS
  cartData: {
    type: Object,
    default: {}
  }

}, { timestamps: true });

export default mongoose.model("User", userSchema);