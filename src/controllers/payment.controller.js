const PaymentService = require("../services/payment.service");
const ApiResponse = require("../utils/responses");
const { ValidationError, NotFoundError } = require("../utils/errors");

exports.processPayment = async (req, res, next) => {
  try {
    const { orderId, method, paymentDetails } = req.body;

    if (!orderId) {
      throw new ValidationError("Order ID is required");
    }

    if (!["card", "wallet", "cod"].includes(method)) {
      throw new ValidationError("Invalid payment method");
    }

    if (method === "card" && !paymentDetails?.cardNumber) {
      throw new ValidationError("Card details are required for card payment");
    }

    const payment = await PaymentService.processPayment(
      orderId,
      req.user.id,
      method,
      paymentDetails
    );

    res
      .status(200)
      .json(ApiResponse.success("Payment processed successfully", { payment }));
  } catch (err) {
    next(err);
  }
};

exports.confirmCODPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const payment = await PaymentService.confirmCODPayment(paymentId);

    res
      .status(200)
      .json(ApiResponse.success("COD payment confirmed", { payment }));
  } catch (err) {
    next(err);
  }
};

exports.processRefund = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await PaymentService.processRefund(paymentId, reason);

    res
      .status(200)
      .json(ApiResponse.success("Refund processed successfully", { payment }));
  } catch (err) {
    next(err);
  }
};

exports.getPaymentsByOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const payments = await Payment.find({ order: orderId });

    res
      .status(200)
      .json(
        ApiResponse.success("Payments retrieved successfully", { payments })
      );
  } catch (err) {
    next(err);
  }
};
