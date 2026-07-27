import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "default", unique: true },

    deliveryFee: { type: Number, default: 50 },
    freeShippingThreshold: { type: Number, default: 999 },
    codEnabled: { type: Boolean, default: true },

    /** Partial / advance payment (only effective when PARTIAL_PAYMENT_ENABLED=true) */
    partialPayment: {
      active: { type: Boolean, default: true },
      percent: { type: Number, default: 20 },
      label: {
        type: String,
        default: "Pay advance now, rest on delivery",
      },
      policyNotice: {
        type: String,
        default:
          "Paying an advance now reserves your order and helps cover logistics. If the parcel is refused or returned undelivered, the advance may be retained as per our policy. The remaining amount is payable only on successful delivery.",
      },
      /** When true, hide classic COD and use Partial instead */
      replaceCod: { type: Boolean, default: true },
      keepAdvanceOnRto: { type: Boolean, default: true },
      /** Minimum advance in ₹ (overrides env default when set) */
      minAdvanceAmount: { type: Number, default: 50 },
    },

    homeConfig: {
      showHero: { type: Boolean, default: true },
      showCategories: { type: Boolean, default: true },
      showNewArrivals: { type: Boolean, default: true },
      showBestSellers: { type: Boolean, default: true },
      showInstagram: { type: Boolean, default: true },
      showReviews: { type: Boolean, default: true },
      newArrivalsTitle: { type: String, default: "NEW ARRIVALS" },
      bestSellersTitle: { type: String, default: "TOP BEST SELLERS" },
      /** Product ObjectIds to feature on homepage (overrides newest if non-empty) */
      featuredProductIds: { type: [String], default: [] },
    },

    /** Admin-managed shop-by-category tiles */
    categoryTiles: {
      type: [
        {
          label: { type: String, required: true },
          link: { type: String, required: true },
          image: { type: String, default: "" },
          order: { type: Number, default: 0 },
        },
      ],
      default: [
        {
          label: "Men",
          link: "/shop?department=men",
          image: "/brand/categories/men.jpg",
          order: 0,
        },
        {
          label: "Women",
          link: "/shop?department=women",
          image: "/brand/categories/women.jpg",
          order: 1,
        },
        {
          label: "Bags",
          link: "/shop?department=bags",
          image: "/brand/categories/bags.jpg",
          order: 2,
        },
        {
          label: "Accessories",
          link: "/shop?department=accessories",
          image: "/brand/categories/accessories.jpg",
          order: 3,
        },
      ],
    },

    promoStrip: {
      isActive: { type: Boolean, default: true },
      message: {
        type: String,
        default: "FREE SHIPPING ON ORDERS OVER ₹999 — AFIYA LEATHERS",
      },
      link: { type: String, default: "/shop" },
    },
    
    aboutConfig: {
      heroVideo: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export default mongoose.model("SiteSettings", siteSettingsSchema);
