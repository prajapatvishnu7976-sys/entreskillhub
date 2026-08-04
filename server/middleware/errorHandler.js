// ============================================
// EntreSkillHub - Global Error Handler
// Centralized error handling middleware
// ============================================

const ApiResponse = require('../utils/apiResponse');

// ============================================
// Custom Error Class
// ============================================
class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// ============================================
// Handle Cast Errors (Invalid MongoDB IDs)
// ============================================
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}. Please provide a valid ID.`;
  return new AppError(message, 400, 'INVALID_ID');
};

// ============================================
// Handle Duplicate Field Errors
// ============================================
const handleDuplicateFieldError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists. Please use a different value.`;
  return new AppError(message, 409, 'DUPLICATE_ENTRY');
};

// ============================================
// Handle Validation Errors
// ============================================
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message,
    value: el.value,
  }));

  const message = 'Validation failed. Please check your input.';
  const appError = new AppError(message, 400, 'VALIDATION_ERROR');
  appError.errors = errors;
  return appError;
};

// ============================================
// Handle JWT Errors
// ============================================
const handleJWTError = () => {
  return new AppError('Invalid token. Please login again.', 401, 'INVALID_TOKEN');
};

const handleJWTExpiredError = () => {
  return new AppError('Your session has expired. Please login again.', 401, 'TOKEN_EXPIRED');
};

// ============================================
// Handle Multer Errors (File Upload)
// ============================================
const handleMulterError = (err) => {
  let message = 'File upload error.';
  let code = 'UPLOAD_ERROR';

  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      message = 'File size too large. Maximum size allowed is 10MB.';
      code = 'FILE_TOO_LARGE';
      break;
    case 'LIMIT_FILE_COUNT':
      message = 'Too many files uploaded. Maximum 5 files allowed.';
      code = 'TOO_MANY_FILES';
      break;
    case 'LIMIT_UNEXPECTED_FILE':
      message = `Unexpected field: ${err.field}`;
      code = 'UNEXPECTED_FIELD';
      break;
    case 'LIMIT_PART_COUNT':
      message = 'Too many parts in multipart request.';
      break;
  }

  return new AppError(message, 400, code);
};

// ============================================
// Development Error Response (Detailed)
// ============================================
const sendErrorDev = (err, req, res) => {
  console.error('');
  console.error('╔══════════════════════════════════════════╗');
  console.error('║           🔴 DEVELOPMENT ERROR           ║');
  console.error('╚══════════════════════════════════════════╝');
  console.error(`📍 Path: ${req.method} ${req.originalUrl}`);
  console.error(`📅 Time: ${new Date().toISOString()}`);
  console.error(`👤 User: ${req.user?._id || 'Not authenticated'}`);
  console.error(`❌ Error: ${err.message}`);
  console.error(`📊 Status: ${err.statusCode || 500}`);
  console.error(`🔍 Stack:`, err.stack);
  console.error('');

  return res.status(err.statusCode || 500).json({
    success: false,
    status: err.status || 'error',
    message: err.message,
    errorCode: err.errorCode,
    errors: err.errors || null,
    stack: err.stack,
    error: {
      name: err.name,
      code: err.code,
    },
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
};

// ============================================
// Production Error Response (Sanitized)
// ============================================
const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      errorCode: err.errorCode,
      errors: err.errors || undefined,
      timestamp: new Date().toISOString(),
    });
  }

  // Programming or unknown error: don't leak error details
  console.error('');
  console.error('╔══════════════════════════════════════════╗');
  console.error('║       🔴 UNKNOWN PRODUCTION ERROR        ║');
  console.error('╚══════════════════════════════════════════╝');
  console.error(`📍 Path: ${req.method} ${req.originalUrl}`);
  console.error(`❌ Error:`, err);
  console.error('');

  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Something went wrong on our end. Please try again later.',
    errorCode: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString(),
  });
};

// ============================================
// Main Error Handler Middleware
// ============================================
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    error.stack = err.stack;

    // Handle specific errors
    if (err.name === 'CastError') error = handleCastError(err);
    if (err.code === 11000) error = handleDuplicateFieldError(err);
    if (err.name === 'ValidationError') error = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (err.name === 'MulterError') error = handleMulterError(err);

    sendErrorDev(error, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    if (err.name === 'CastError') error = handleCastError(err);
    if (err.code === 11000) error = handleDuplicateFieldError(err);
    if (err.name === 'ValidationError') error = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (err.name === 'MulterError') error = handleMulterError(err);

    sendErrorProd(error, req, res);
  }
};

// ============================================
// 404 Not Found Handler
// ============================================
const notFoundHandler = (req, res, next) => {
  const err = new AppError(
    `Route not found: ${req.method} ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(err);
};

// ============================================
// Async Handler Wrapper
// Catches errors from async route handlers
// ============================================
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ============================================
// Handle Uncaught Exceptions
// ============================================
process.on('uncaughtException', (err) => {
  console.error('');
  console.error('╔══════════════════════════════════════════╗');
  console.error('║        💥 UNCAUGHT EXCEPTION!            ║');
  console.error('║        Shutting down server...           ║');
  console.error('╚══════════════════════════════════════════╝');
  console.error('❌ Error:', err.name, '-', err.message);
  console.error('📚 Stack:', err.stack);
  console.error('');
  process.exit(1);
});

// ============================================
// Handle Unhandled Promise Rejections
// ============================================
process.on('unhandledRejection', (err) => {
  console.error('');
  console.error('╔══════════════════════════════════════════╗');
  console.error('║      💥 UNHANDLED PROMISE REJECTION!     ║');
  console.error('╚══════════════════════════════════════════╝');
  console.error('❌ Error:', err.name, '-', err.message);
  console.error('📚 Stack:', err.stack);
  console.error('');
});

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
};