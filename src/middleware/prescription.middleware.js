const { ValidationError } = require("../utils/errors");

exports.validatePrescriptionVerification = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      throw new ValidationError("Verification status is required");
    }

    if (!["approved", "rejected"].includes(status)) {
      throw new ValidationError("Status must be either approved or rejected");
    }

    if (status === "rejected" && !notes) {
      throw new ValidationError(
        "Notes are required when rejecting prescription"
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};
