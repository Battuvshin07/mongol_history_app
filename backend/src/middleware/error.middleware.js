// ============================================
// Error Handling Middleware
// Centralized error responses
// ============================================

const { STATUS } = require('../config/constants');

/**
 * 404 - Not Found handler.
 * Catches requests to undefined routes.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = STATUS.NOT_FOUND;
  next(error);
};

/**
 * Global error handler middleware.
 * Catches all errors thrown or passed via next(error).
 * Returns consistent JSON error responses.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || STATUS.INTERNAL_ERROR;
  let message = err.message || 'Internal Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = STATUS.BAD_REQUEST;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = STATUS.CONFLICT;
    const field = Object.keys(err.keyValue).join(', ');
    message = `Duplicate value for field: ${field}. Please use a different value.`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = STATUS.BAD_REQUEST;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join('. ');
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
