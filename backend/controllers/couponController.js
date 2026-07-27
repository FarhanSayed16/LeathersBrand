import Coupon from "../models/couponModel.js";

const createCoupon = async (req, res) => {
  try {
    const { code, discount, expiry, usageLimit } = req.body;

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ error: "Coupon code already exists" });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discount,
      expiry,
      usageLimit: Number(usageLimit) || 0,
    });

    await coupon.save();
    res.status(201).json({ message: "Coupon created successfully", coupon });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const { code } = req.params;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ error: "Invalid coupon code" });
    }

    if (new Date() > coupon.expiry) {
      return res.status(400).json({ error: "Coupon has expired" });
    }

    if (coupon.usageLimit > 0 && coupon.usedBy.length >= coupon.usageLimit) {
      return res.status(400).json({ error: "Coupon usage limit reached" });
    }

    const userId = req.user?._id || req.userId;
    if (coupon.usedBy?.length && userId) {
      const used = coupon.usedBy.some(
        (id) => String(id) === String(userId)
      );
      if (used) {
        return res.status(400).json({ error: "You have already used this coupon" });
      }
    }

    res.json({ valid: true, discount: coupon.discount });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { createCoupon, validateCoupon, getAllCoupons, deleteCoupon };
