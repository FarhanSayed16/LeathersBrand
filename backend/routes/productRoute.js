import express from "express";
import {
  listProduct,
  addProduct,
  removeProduct,
  singleProduct,
  editProduct,
  getVariants,
  getProductById,
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

const imageFields = upload.fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 },
  { name: "sizeimage1", maxCount: 1 },
  { name: "sizeimage2", maxCount: 1 },
]);

productRouter.post("/add", adminAuth, imageFields, addProduct);
productRouter.post("/remove", adminAuth, removeProduct);
productRouter.get("/variants/:parentId", getVariants);
productRouter.post("/single", adminAuth, singleProduct);
productRouter.get("/list", listProduct);
productRouter.get("/:id", getProductById);
productRouter.put("/edit/:productId", adminAuth, imageFields, editProduct);

export default productRouter;
