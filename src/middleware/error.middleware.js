const { AppError } = require("../utils/errors");
const ApiResponse = require("../utils/responses");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // Development vs Production error handling
  if (process.env.NODE_ENV === "development") {
    if (err.name === "CastError") err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === "ValidationError") err = handleValidationErrorDB(err);

    res.status(err.statusCode).json(
      ApiResponse.error(err.message, {
        error: err,
        stack: err.stack,
      })
    );
  } else {
    // Production
    if (err.isOperational) {
      res.status(err.statusCode).json(ApiResponse.error(err.message));
    } else {
      res.status(500).json(ApiResponse.error("Something went wrong!"));
    }
  }
};

module.exports = errorHandler;
