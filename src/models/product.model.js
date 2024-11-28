const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Product name must be at least 3 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Price must be a valid number",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["prescription", "otc", "healthcare", "supplies"],
      index: true,
    },
    manufacturer: {
      type: String,
      required: [true, "Manufacturer is required"],
      index: true,
    },
    activeIngredients: [
      {
        type: String,
        required: true,
      },
    ],
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock quantity must be a whole number",
      },
    },
    imageUrls: [String],
    dosageForm: {
      type: String,
      enum: ["tablet", "capsule", "liquid", "cream", "injection", "other"],
    },
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
    sideEffects: [String],
    contraindications: [String],
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
      validate: {
        validator: function (value) {
          return value > Date.now();
        },
        message: "Expiry date must be in the future",
      },
    },
    batchNumber: {
      type: String,
      required: [true, "Batch number is required"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for search
productSchema.index({
  name: "text",
  description: "text",
  manufacturer: "text",
  category: "text",
  activeIngredients: "text",
});

// Add index for expiry date queries
productSchema.index({ expiryDate: 1 });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
