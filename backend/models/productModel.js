import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  secondaryName: { type: String, required: true },
  parentId: { type: String, required: true, index: true },
  description: { type: String, required: true },

  price: { type: Number, required: true },
  oldPrice: { type: Number },
  discount: { type: Number },

  image: { type: Array, required: true },
  viewsizeimage: { type: Array, required: false, default: [] },

  /**
   * Department slug: men | women | bags | accessories | home-living | collections | custom-made | sale
   * Also stored on order line items for analytics.
   */
  department: { type: String, required: true, index: true },

  /** Leaf category reference + denormalized slug/name */
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    index: true,
  },
  categorySlug: { type: String, index: true },
  /** Display / legacy field — leaf category name (or department if unset) */
  category: { type: String, required: true, index: true },
  subCategory: { type: String, index: true },

  gender: {
    type: String,
    enum: ["men", "women", "unisex", ""],
    default: "",
    index: true,
  },

  material: { type: String },
  dimensions: { type: String },

  availableQuantity: { type: Number, required: true },
  sizes: { type: Array, required: true, default: ["One Size"] },

  bestseller: { type: Boolean, default: false, index: true },
  featured: { type: Boolean, default: false, index: true },
  tags: { type: [String], default: [] },

  color: { type: String, required: true },
  date: { type: Number, required: true },
  status: { type: String, default: "" },
});

productSchema.index({ department: 1, categorySlug: 1 });
productSchema.index({ tags: 1 });

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
