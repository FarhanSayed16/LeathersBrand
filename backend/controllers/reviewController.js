import reviewModel from "../models/reviewModel.js";

// Get all reviews for a specific product
export const getReviews = async (req, res) => {
  try {
    const productId = req.params.productId;
    const reviews = await reviewModel.find({ productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// Get all reviews across all products (for Admin Panel)
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await reviewModel.find({}).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// Add a new review
export const addReview = async (req, res) => {
  try {
    const { productId, name, comment, rating } = req.body;



    const newReview = new reviewModel({ productId, name, comment, rating });
    await newReview.save();

    res.status(201).json(newReview);
  } catch (err) {
    console.error("Review Error:", err); // Print full error
    res.status(500).json({ error: err.message }); // Return error reason
  }
};

