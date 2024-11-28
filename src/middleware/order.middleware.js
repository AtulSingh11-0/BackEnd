const { ValidationError } = require("../utils/errors");

exports.validateOrderOperation = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "pending",
      "awaiting_prescription",
      "processing",
      "confirmed",
      "packed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (status && !validStatuses.includes(status)) {
      throw new ValidationError(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};

exports.validateOrderCreation = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress) {
      throw new ValidationError("Shipping address is required");
    }

    if (!paymentMethod) {
      throw new ValidationError("Payment method is required");
    }

    if (!["card", "wallet", "cod"].includes(paymentMethod)) {
      throw new ValidationError("Invalid payment method");
    }

    next();
  } catch (err) {
    next(err);
  }
};
