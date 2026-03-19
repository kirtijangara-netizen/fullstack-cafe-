const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    userName: {
      type: String,
      required: true,
      trim: true
    },

    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    items: {
      type: [orderItemSchema],
      validate: [(val) => val.length > 0, "Order must have at least one item"]
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    pickupTime: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["Pending", "Preparing", "Delivered", "Cancelled"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);