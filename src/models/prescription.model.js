const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Prescription image is required"],
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verificationNotes: String,
    verifiedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);
module.exports = Prescription;
