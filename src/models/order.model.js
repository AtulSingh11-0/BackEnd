const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity cannot be less than 1"],
  },
  price: {
    type: Number,
    required: true,
  },
});

const trackingUpdateSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: [
      "pending",
      "processing",
      "packed",
      "shipped",
      "delivered",
      "cancelled",
    ],
    required: true,
  },
  location: String,
  description: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "Order must contain at least one item",
      },
    },
    shippingAddress: {
      street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true,
        minlength: [5, "Street address is too short"],
        maxlength: [100, "Street address is too long"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
        validate: {
          validator: function (v) {
            return /^[a-zA-Z\s]{2,50}$/.test(v);
          },
          message: "City name contains invalid characters",
        },
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
        validate: {
          validator: function (v) {
            return /^[a-zA-Z\s]{2,50}$/.test(v);
          },
          message: "State name contains invalid characters",
        },
      },
      zipCode: {
        type: String,
        required: [true, "ZIP code is required"],
        validate: {
          validator: function (v) {
            return /^\d{6}$/.test(v);
          },
          message: "Please enter a valid 6-digit ZIP code",
        },
      },
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["card", "wallet", "cod"],
        message:
          "Payment method must be either card, wallet, or cash on delivery",
      },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "awaiting_prescription",
        "processing",
        "confirmed",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
      validate: {
        validator: function (value) {
          return value === Math.round(value * 100) / 100;
        },
        message: "Amount can only have up to 2 decimal places",
      },
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    prescriptionRequired: {
      type: Boolean,
      default: false,
    },
    prescriptionImage: {
      type: String,
    },
    prescriptionStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "not_required"],
      default: "not_required",
    },
    tracking: {
      currentStatus: {
        type: String,
        enum: [
          "pending",
          "processing",
          "packed",
          "shipped",
          "delivered",
          "cancelled",
        ],
        default: "pending",
      },
      trackingNumber: String,
      currentLocation: String,
      estimatedDelivery: Date,
      updates: [trackingUpdateSchema],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware for additional validations
orderSchema.pre("save", function (next) {
  if (this.items.length === 0) {
    next(new Error("Order must contain at least one item"));
  }

  if (this.prescriptionRequired && !this.prescriptionStatus) {
    next(new Error("Prescription status is required for prescription orders"));
  }

  next();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
