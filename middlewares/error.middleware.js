const ErrorResponse = require('../utils/errorResponse.util');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found.';
    error = new ErrorResponse(message, 404);
  }

  // celebrate validation error
  if (error?.details?.get('body')?.stack?.includes('ValidationError')) {
    error = new ErrorResponse(error.details.get('body').stack, 422);
  }
  // console.log(error);

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
