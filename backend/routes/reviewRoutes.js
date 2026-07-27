import express from "express";
import { getReviews, addReview, getAllReviews } from "../controllers/reviewController.js";
import authUser from "../middleware/auth.js";

const reviewRouter = express.Router();

reviewRouter.get("/", getAllReviews);
reviewRouter.get("/:productId", getReviews);
reviewRouter.post("/", authUser, addReview);

export default reviewRouter;
