const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const Payment = require("../models/payment.model"); // Add this import
const PaymentService = require("../services/payment.service");
const ApiResponse = require("../utils/responses");
const { ValidationError, NotFoundError } = require("../utils/errors");
const shippingService = require("../services/shipping.service");

exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      throw new ValidationError("Cannot create order with an empty cart");
    }

    // Validate payment method
    if (!["card", "wallet", "cod"].includes(paymentMethod)) {
      throw new ValidationError("Invalid payment method");
    }

    // Check stock and prescription requirements
    let prescriptionRequired = false;
    for (const item of cart.items) {
      if (item.quantity > item.product.stockQuantity) {
        throw new ValidationError(
          `Insufficient stock for ${item.product.name}`
        );
      }
      if (item.product.requiresPrescription) {
        prescriptionRequired = true;
      }
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    // Helper function to round numbers to two decimal places
    const roundToTwo = (num) => Math.round(num * 100) / 100;

    // Calculate totals
    const subtotal = cart.totalAmount; // Assuming this is already calculated in the cart
    const tax = roundToTwo(subtotal * 0.1);
    const shippingFee = roundToTwo(
      shippingService.calculateShippingFee(cart.items, shippingAddress)
    );
    const totalAmount = roundToTwo(subtotal + shippingFee + tax);

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      totalAmount,
      shippingFee,
      tax,
      prescriptionRequired,
      prescriptionStatus: prescriptionRequired ? "pending" : "not_required",
      orderStatus: prescriptionRequired ? "awaiting_prescription" : "pending",
    });

    // Process payment
    try {
      const payment = await PaymentService.processPayment(
        order._id,
        req.user.id,
        paymentMethod,
        req.body.paymentDetails || {}
      );

      // Update order with payment status
      order.paymentStatus = payment.status;
      await order.save();

      // Only update stock for non-prescription orders with successful payment
      if (!prescriptionRequired && payment.status === "completed") {
        for (const item of cart.items) {
          await Product.findByIdAndUpdate(item.product._id, {
            $inc: { stockQuantity: -item.quantity },
          });
        }
      }

      // Clear cart
      await Cart.findByIdAndDelete(cart._id);

      res
        .status(201)
        .json(
          ApiResponse.success(
            prescriptionRequired
              ? "Order created. Please upload prescription"
              : "Order created successfully",
            { order, payment, requiresPrescription: prescriptionRequired }
          )
        );
    } catch (paymentError) {
      // If payment fails, mark order as failed
      order.paymentStatus = "failed";
      await order.save();
      throw new Error(`Payment failed: ${paymentError.message}`);
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json(ApiResponse.success("Orders retrieved successfully", { orders }));
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("items.product");

    if (!order) {
      return res.status(404).json(ApiResponse.error("Order not found"));
    }

    res
      .status(200)
      .json(ApiResponse.success("Order retrieved successfully", { order }));
  } catch (err) {
    next(err);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json(ApiResponse.error("Order not found"));
    }

    // Only prevent cancellation for delivered or already cancelled orders
    if (["delivered", "cancelled"].includes(order.orderStatus)) {
      return res
        .status(400)
        .json(
          ApiResponse.error(
            "Cannot cancel a delivered or already cancelled order"
          )
        );
    }

    // Restore stock if it was deducted (for confirmed orders)
    if (
      ["confirmed", "processing", "packed", "shipped"].includes(
        order.orderStatus
      )
    ) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: item.quantity },
        });
      }
    }

    // If payment was completed, initiate refund
    if (order.paymentStatus === "completed") {
      const payment = await Payment.findOne({ order: order._id });
      if (payment) {
        await PaymentService.processRefund(
          payment._id,
          reason || "No reason provided"
        );
      }
    }

    order.orderStatus = "cancelled";
    order.cancellationReason = reason || "Cancelled by user";
    await order.save();

    res
      .status(200)
      .json(ApiResponse.success("Order cancelled successfully", { order }));
  } catch (err) {
    next(err);
  }
};

exports.getPrescriptionRequiredOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
      prescriptionRequired: true,
      prescriptionStatus: { $in: ["pending", "rejected"] },
    }).populate("items.product");

    res.status(200).json(
      ApiResponse.success("Prescription required orders retrieved", {
        orders,
      })
    );
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json(ApiResponse.error("Order not found"));
    }

    // Check prescription status for orders requiring prescription
    if (order.prescriptionRequired && status === "confirmed") {
      if (order.prescriptionStatus !== "approved") {
        return res
          .status(400)
          .json(
            ApiResponse.error(
              "Cannot confirm order without prescription approval"
            )
          );
      }
    }

    order.orderStatus = status;

    // Update stock when order is confirmed
    if (status === "confirmed" && order.prescriptionRequired) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: -item.quantity },
        });
      }
    }

    await order.save();

    res
      .status(200)
      .json(
        ApiResponse.success("Order status updated successfully", { order })
      );
  } catch (err) {
    next(err);
  }
};
