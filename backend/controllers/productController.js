import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import Category from "../models/Category.js";
import brand from "../../shared/brand.config.js";
import { resolveDepartmentSlug } from "../utils/categoryHelpers.js";

const cloudinaryFolder = () =>
  process.env.CLOUDINARY_FOLDER ||
  brand.commerce?.cloudinaryFolder ||
  brand.id ||
  "products";

const parseTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(String).map((t) => t.trim()).filter(Boolean);
  try {
    const parsed = JSON.parse(tags);
    if (Array.isArray(parsed)) return parsed.map(String).map((t) => t.trim()).filter(Boolean);
  } catch {
    /* comma-separated */
  }
  return String(tags)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
};

const parseBool = (v) => v === true || v === "true" || v === "1";

const uploadImages = async (files = []) => {
  const list = files.filter(Boolean);
  const folder = `${cloudinaryFolder()}/products`;
  return Promise.all(
    list.map(async (item) => {
      const base64Image = `data:${item.mimetype};base64,${item.buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(base64Image, {
        resource_type: "image",
        folder,
      });
      return result.secure_url;
    })
  );
};

/** Resolve department + leaf metadata from categoryId or legacy department slug */
async function resolveCatalogFields({ categoryId, department, category, subCategory, gender }) {
  if (categoryId) {
    const leaf = await Category.findById(categoryId);
    if (!leaf) {
      throw new Error("Category not found");
    }
    const all = await Category.find({}).select("_id parentId type slug name").lean();
    const byId = new Map(all.map((c) => [String(c._id), c]));
    const deptSlug = resolveDepartmentSlug(leaf, byId) || department || leaf.slug;
    return {
      department: deptSlug,
      categoryId: leaf._id,
      categorySlug: leaf.slug,
      category: leaf.name,
      subCategory: subCategory === "NotSelected" ? "" : subCategory || leaf.name,
      gender: gender || leaf.gender || "",
    };
  }

  if (!department && !category) {
    throw new Error("department or categoryId is required");
  }

  return {
    department: department || category,
    categoryId: undefined,
    categorySlug: category || department,
    category: category || department,
    subCategory: subCategory === "NotSelected" ? "" : subCategory || "",
    gender: gender || "",
  };
}

const addProduct = async (req, res) => {
  try {
    const {
      name,
      secondaryName,
      description,
      price,
      oldPrice,
      discount,
      category,
      categoryId,
      department,
      subCategory,
      gender,
      material,
      dimensions,
      availableQuantity,
      sizes,
      bestseller,
      featured,
      tags,
      color,
      parentId,
      status,
    } = req.body;

    let catalog;
    try {
      catalog = await resolveCatalogFields({
        categoryId,
        department,
        category,
        subCategory,
        gender,
      });
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }

    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];
    const imagesUrl = await uploadImages([image1, image2, image3, image4]);

    if (!imagesUrl.length) {
      return res.json({ success: false, message: "At least one product image is required" });
    }

    const sizeimage1 = req.files?.sizeimage1?.[0];
    const sizeimage2 = req.files?.sizeimage2?.[0];
    const sizeimagesUrl = await uploadImages([sizeimage1, sizeimage2]);

    let parsedSizes = ["One Size"];
    try {
      parsedSizes = JSON.parse(sizes);
      if (!Array.isArray(parsedSizes) || !parsedSizes.length) parsedSizes = ["One Size"];
    } catch {
      parsedSizes = ["One Size"];
    }

    const product = new productModel({
      name,
      secondaryName,
      description,
      parentId: parentId || `af-${Date.now()}`,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      discount: discount ? Number(discount) : undefined,
      department: catalog.department,
      categoryId: catalog.categoryId,
      categorySlug: catalog.categorySlug,
      category: catalog.category,
      subCategory: catalog.subCategory,
      gender: catalog.gender || "",
      material,
      dimensions,
      availableQuantity: Number(availableQuantity),
      sizes: parsedSizes,
      bestseller: parseBool(bestseller),
      featured: parseBool(featured),
      tags: parseTags(tags),
      color,
      image: imagesUrl,
      viewsizeimage: sizeimagesUrl,
      date: Date.now(),
      status: status || "",
    });

    await product.save();
    res.json({ success: true, message: "Product Added", product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const getVariants = async (req, res) => {
  try {
    const { parentId } = req.params;
    const products = await productModel.find({ parentId: String(parentId) });
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const listProduct = async (req, res) => {
  try {
    const {
      page,
      limit,
      category,
      department,
      categorySlug,
      gender,
      tag,
      bestseller,
      featured,
      search,
    } = req.query;

    const filter = {};
    if (department) filter.department = department;
    if (categorySlug) filter.categorySlug = categorySlug;
    if (gender) filter.gender = gender;
    if (tag) filter.tags = tag;
    // Legacy: ?category=Tote|Accessory → treat as department if matches known, else leaf name
    if (category && category !== "All") {
      if (["men", "women", "bags", "accessories", "home-living", "collections", "custom-made", "sale"].includes(category)) {
        filter.department = category;
      } else if (["Tote", "Accessory", "Bundle"].includes(category)) {
        // old enum no longer used — ignore / map loosely
        if (category === "Accessory") filter.department = "accessories";
        else filter.department = { $in: ["men", "women"] };
      } else {
        filter.$or = [
          ...(filter.$or || []),
          { category },
          { categorySlug: category },
          { subCategory: category },
        ];
      }
    }
    if (bestseller === "true") filter.bestseller = true;
    if (featured === "true") filter.featured = true;
    if (search) {
      const q = String(search).trim();
      const searchOr = [
        { name: { $regex: q, $options: "i" } },
        { secondaryName: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
      filter.$and = [...(filter.$and || []), { $or: searchOr }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 0);
    const limitNum = Math.max(0, parseInt(limit, 10) || 0);

    const total = await productModel.countDocuments(filter);
    let query = productModel.find(filter).sort({ date: -1 });

    if (pageNum && limitNum) {
      query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const products = await query;
    res.json({
      success: true,
      products,
      total,
      page: pageNum || 1,
      limit: limitNum || total,
      pages: limitNum ? Math.ceil(total / limitNum) : 1,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/** Public GET by id */
const getProductById = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const editProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      name,
      secondaryName,
      description,
      price,
      oldPrice,
      discount,
      category,
      categoryId,
      department,
      subCategory,
      gender,
      material,
      dimensions,
      availableQuantity,
      sizes,
      bestseller,
      featured,
      tags,
      color,
      parentId,
      status,
    } = req.body;

    const existing = await productModel.findById(productId);
    if (!existing) {
      return res.json({ success: false, message: "Product not found" });
    }

    let catalog = null;
    if (categoryId || department || category) {
      try {
        catalog = await resolveCatalogFields({
          categoryId: categoryId || existing.categoryId,
          department: department || existing.department,
          category: category || existing.category,
          subCategory,
          gender: gender !== undefined ? gender : existing.gender,
        });
      } catch (err) {
        return res.json({ success: false, message: err.message });
      }
    }

    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];
    const newImages = await uploadImages([image1, image2, image3, image4]);

    const sizeimage1 = req.files?.sizeimage1?.[0];
    const sizeimage2 = req.files?.sizeimage2?.[0];
    const newSizeImages = await uploadImages([sizeimage1, sizeimage2]);

    let parsedSizes = existing.sizes;
    if (sizes) {
      try {
        parsedSizes = JSON.parse(sizes);
      } catch {
        /* keep existing */
      }
    }

    const productData = {
      name: name ?? existing.name,
      secondaryName: secondaryName ?? existing.secondaryName,
      description: description ?? existing.description,
      parentId: parentId || existing.parentId,
      price: price !== undefined ? Number(price) : existing.price,
      oldPrice: oldPrice !== undefined && oldPrice !== "" ? Number(oldPrice) : existing.oldPrice,
      discount: discount !== undefined && discount !== "" ? Number(discount) : existing.discount,
      department: catalog?.department || existing.department,
      categoryId: catalog?.categoryId || existing.categoryId,
      categorySlug: catalog?.categorySlug || existing.categorySlug,
      category: catalog?.category || category || existing.category,
      subCategory:
        catalog?.subCategory !== undefined
          ? catalog.subCategory
          : subCategory === "NotSelected"
            ? ""
            : subCategory !== undefined
              ? subCategory
              : existing.subCategory,
      gender: catalog?.gender !== undefined ? catalog.gender : existing.gender || "",
      material: material ?? existing.material,
      dimensions: dimensions ?? existing.dimensions,
      availableQuantity:
        availableQuantity !== undefined
          ? Number(availableQuantity)
          : existing.availableQuantity,
      sizes: parsedSizes,
      bestseller:
        bestseller !== undefined ? parseBool(bestseller) : existing.bestseller,
      featured:
        featured !== undefined ? parseBool(featured) : existing.featured,
      tags: tags !== undefined ? parseTags(tags) : existing.tags,
      color: color || existing.color,
      image: newImages.length ? newImages : existing.image,
      viewsizeimage: newSizeImages.length ? newSizeImages : existing.viewsizeimage,
      status: status !== undefined ? status : existing.status,
    };

    await productModel.findByIdAndUpdate(productId, productData, { returnDocument: "after" });
    res.json({ success: true, message: "Update Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  listProduct,
  addProduct,
  removeProduct,
  singleProduct,
  editProduct,
  getProductById,
};
