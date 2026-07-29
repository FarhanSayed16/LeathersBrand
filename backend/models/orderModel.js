import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    image: {
      type: [String],          // ✅ REQUIRED FIX
      required: true,
    },
    category: String,
    subCategory: String,
    cancelledBy: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: null
    },
    status: {
      type: String,
      enum: [
        "OrderPlaced",
        "Packing",
        "Shipped",
        "OutForDelivery",
        "Delivered",
        "Cancelled",
        "RTO",
        "ReturnRequested",
        "ReturnInTransit",
        "Returned",
      ],
      default: "OrderPlaced",
    },
  },
  { _id: true } // ✅ ensures _id exists for every item
);

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    index: true,
  },
  items: {
    type: [orderItemSchema], // ✅ FIX
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  address: {
    type: Object,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  payment: {
    type: Boolean,
    default: false,
  },

  // Partial / advance payment breakdown (Phase 1)
  paymentDetails: {
    currency: { type: String, default: "INR" },
    orderTotal: { type: Number, default: null },
    advancePercent: { type: Number, default: null },
    advanceAmount: { type: Number, default: null },
    balanceAmount: { type: Number, default: null },
    advancePaid: { type: Boolean, default: false },
    balancePaid: { type: Boolean, default: false },
    advancePaymentId: { type: String, default: null },
    advanceOrderId: { type: String, default: null },
    balanceCollectedAt: { type: Date, default: null },
    balanceCollectedBy: { type: String, default: null },
    advanceKeptOnRto: { type: Boolean, default: false },
    advanceRefunded: { type: Boolean, default: false },
    advanceRefundId: { type: String, default: null },
    advanceRefundedAt: { type: Date, default: null },
    advanceRefundAmount: { type: Number, default: null },
  },

  date: {
    type: Number,
    required: true,
  },
  orderFrom: {
    type: String,
    enum: ["USER", "web", "app", "admin"],
    default: "USER"
  },

  cancelledBy: {
    type: String,
    enum: ["USER", "ADMIN"],
    default: null,
  },

  // Courier / shipping partner payload (order-level for v1)
  shipping: {
    partner: { type: String, default: null }, // e.g. "shiprocket"
    shiprocketOrderId: { type: String, default: null },
    shipmentId: { type: String, default: null },
    awbCode: { type: String, default: null },
    courierName: { type: String, default: null },
    trackingUrl: { type: String, default: null },
    status: { type: String, default: null }, // partner status string
    lastWebhookAt: { type: Date, default: null },
    labelUrl: { type: String, default: null },
    pickupScheduled: { type: Boolean, default: false },
    // Package dims (admin override before ship)
    weight: { type: Number, default: null }, // kg
    length: { type: Number, default: null }, // cm
    breadth: { type: Number, default: null },
    height: { type: Number, default: null },
    // Cost visibility
    freightCharge: { type: Number, default: null }, // actual courier cost
    chargedFee: { type: Number, default: null }, // what customer paid
    // Reverse logistics
    return: {
      requested: { type: Boolean, default: false },
      requestedAt: { type: Date, default: null },
      reason: { type: String, default: null },
      approvedAt: { type: Date, default: null },
      shiprocketOrderId: { type: String, default: null },
      shipmentId: { type: String, default: null },
      awbCode: { type: String, default: null },
      courierName: { type: String, default: null },
      trackingUrl: { type: String, default: null },
      status: { type: String, default: null },
      freightCharge: { type: Number, default: null },
    },
  },
},
  {
    timestamps: true, // ✅ CORRECT PLACE
  }
);

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;