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

  // Determine the environment
  const isDevelopment = process.env.NODE_ENV === "development";

  // Set default error message
  let message = err.isOperational ? err.message : "Something went wrong!";

  // Log the error in development mode
  if (isDevelopment) {
    console.error("ERROR 💥", err);
  }

  // Prepare the error response
  const errorResponse = ApiResponse.error(message);

  // Include stack trace and error details in development mode
  if (isDevelopment) {
    errorResponse.error = {
      name: err.name,
      message: err.message,
      stack: err.stack,
    };
  }

  // Send the error response
  res.status(err.statusCode).json(errorResponse);
};

module.exports = errorHandler;
