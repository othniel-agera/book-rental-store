const ErrorResponse = require('../utils/errorResponse.util');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  res.header('Content-Type', 'application/json');
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found.';
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  // celebrate validation error
  if (error?.details?.get('body')?.stack?.includes('ValidationError')) {
    error = new ErrorResponse(error.details.get('body').stack, 422);
  }
  console.log(error);

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
