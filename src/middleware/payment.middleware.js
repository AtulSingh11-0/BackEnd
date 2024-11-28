const { ValidationError } = require("../utils/errors");

exports.validatePaymentOperation = async (req, res, next) => {
  try {
    const { method, paymentDetails } = req.body;

    if (!["card", "wallet", "cod"].includes(method)) {
      throw new ValidationError("Invalid payment method");
    }

    if (method === "card") {
      const { cardNumber, expiryMonth, expiryYear, cvv } = paymentDetails || {};

      if (!cardNumber) {
        throw new ValidationError("Card number is required");
      }

      if (!expiryMonth || !expiryYear) {
        throw new ValidationError("Card expiry is required");
      }

      if (!cvv) {
        throw new ValidationError("CVV is required");
      }

      // Validate card number format
      if (!/^\d{16}$/.test(cardNumber)) {
        throw new ValidationError("Invalid card number format");
      }

      // Validate expiry date
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      if (
        Number(expiryYear) < currentYear ||
        (Number(expiryYear) === currentYear &&
          Number(expiryMonth) < currentMonth)
      ) {
        throw new ValidationError("Card has expired");
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};
