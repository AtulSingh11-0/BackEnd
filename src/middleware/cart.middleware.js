const { ValidationError } = require("../utils/errors");

exports.validateCartOperation = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (quantity !== undefined) {
      if (!Number.isInteger(quantity)) {
        throw new ValidationError("Quantity must be a whole number");
      }

      if (quantity < 1) {
        throw new ValidationError("Quantity must be at least 1");
      }

      if (quantity > 100) {
        throw new ValidationError("Maximum quantity per item is 100");
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};
