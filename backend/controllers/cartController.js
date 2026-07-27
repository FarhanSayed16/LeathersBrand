import userModel from "../models/userModel.js";

// ADD TO CART
const addToCart = async (req, res) => {
  try {
    if (!req.user?._id || req.isAdmin) {
      return res.json({ success: false, message: "Please login as a customer to use cart." });
    }
    const userId = req.user._id; // ✅ FROM TOKEN
    const { itemId, size } = req.body;

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    let cartData = userData.cartData || {};

    if (cartData[itemId]) {
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    userData.cartData = cartData;
    await userData.save();

    res.json({
      success: true,
      message: "Product added to cart"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Add to cart failed"
    });
  }
};


// UPDATE CART
const updateCart = async (req, res) => {
  try {
    if (!req.user?._id || req.isAdmin) {
      return res.json({ success: false, message: "Please login as a customer to use cart." });
    }
    const userId = req.user._id; // ✅ FROM TOKEN
    const { itemId, size, quantity } = req.body;

    const userData = await userModel.findById(userId);

    if (!userData || !userData.cartData[itemId]) {
      return res.json({ success: false, message: "Item not found" });
    }

    userData.cartData[itemId][size] = quantity;
    await userData.save();

    res.json({
      success: true,
      message: "Cart updated"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Update cart failed"
    });
  }
};


// GET USER CART
const getUserCart = async (req, res) => {
  try {
    if (!req.user?._id || req.isAdmin) {
      return res.json({ success: false, message: "Please login as a customer to use cart." });
    }
    const userId = req.user._id; // ✅ FROM TOKEN

    const userData = await userModel.findById(userId);

    res.json({
      success: true,
      cartData: userData.cartData || {}
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart"
    });
  }
};

export { addToCart, updateCart, getUserCart };