const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    image: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent model overwrite error in development
module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);