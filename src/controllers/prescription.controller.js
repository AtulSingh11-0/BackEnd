const Prescription = require("../models/prescription.model");
const Order = require("../models/order.model");
const ApiResponse = require("../utils/responses");

exports.uploadPrescription = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!req.file) {
      return res
        .status(400)
        .json(ApiResponse.error("No prescription image provided"));
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
      prescriptionRequired: true,
      prescriptionStatus: "pending",
    });

    if (!order) {
      return res
        .status(404)
        .json(
          ApiResponse.error("Order not found or prescription not required")
        );
    }

    const prescription = await Prescription.create({
      user: req.user.id,
      order: orderId,
      imageUrl: req.file.path, // Cloudinary URL
    });

    order.prescriptionStatus = "pending";
    await order.save();

    res.status(201).json(
      ApiResponse.success("Prescription uploaded successfully", {
        prescription,
      })
    );
  } catch (err) {
    next(err);
  }
};

exports.getUserPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user.id })
      .populate("order")
      .sort({ createdAt: -1 });

    res.status(200).json(
      ApiResponse.success("Prescriptions retrieved successfully", {
        prescriptions,
      })
    );
  } catch (err) {
    next(err);
  }
};

exports.getPendingPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({
      verificationStatus: "pending",
    })
      .populate("user", "name email")
      .populate("order")
      .sort({ createdAt: 1 });

    res.status(200).json(
      ApiResponse.success("Pending prescriptions retrieved", {
        prescriptions,
      })
    );
  } catch (err) {
    next(err);
  }
};

exports.verifyPrescription = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json(ApiResponse.error("Prescription not found"));
    }

    prescription.verificationStatus = status;
    prescription.verificationNotes = notes;
    prescription.verifiedBy = req.user.id;
    prescription.verifiedAt = new Date();
    await prescription.save();

    // Update order status
    const order = await Order.findById(prescription.order);
    order.prescriptionStatus = status;

    // Update order status based on prescription verification
    if (status === "approved") {
      order.orderStatus = "processing"; // Change status to processing when approved
    } else if (status === "rejected") {
      order.orderStatus = "cancelled";
      order.cancellationReason = "Prescription rejected";
    }

    await order.save();

    res.status(200).json(
      ApiResponse.success("Prescription verified successfully", {
        prescription,
        order,
      })
    );
  } catch (err) {
    next(err);
  }
};
