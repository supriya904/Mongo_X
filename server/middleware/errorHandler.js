const { errorResponse } = require('../utils/responseHelper');

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('🚨 Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
    return errorResponse(res, 'Validation Error', 400, errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return errorResponse(res, `${field} '${value}' already exists`, 409);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, 'Invalid ID format', 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', 401);
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  return errorResponse(res, message, statusCode);
};

// 404 handler for undefined routes
const notFound = (req, res) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};

module.exports = {
  errorHandler,
  notFound
};
