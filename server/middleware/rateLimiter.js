// ============================================
// EntreSkillHub - Rate Limiting Middleware
// Prevents abuse and DDoS attacks
// ============================================

const rateLimit = require('express-rate-limit');
const ApiResponse = require('../utils/apiResponse');

// ============================================
// Custom Handler for Rate Limit Exceeded
// ============================================
const rateLimitHandler = (req, res) => {
  return ApiResponse.tooManyRequests(
    res,
    'Too many requests. Please try again later.',
    {
      retryAfter: res.getHeader('Retry-After'),
      limit: res.getHeader('X-RateLimit-Limit'),
      remaining: res.getHeader('X-RateLimit-Remaining'),
    }
  );
};

// ============================================
// General API Rate Limiter
// 200 requests per 15 minutes
// ============================================
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: 'Too many requests from this IP. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => {
    // Skip rate limiting for admins
    return req.user && ['admin', 'superadmin'].includes(req.user.role);
  },
});

// ============================================
// Authentication Rate Limiter
// 10 attempts per 15 minutes (login, register)
// ============================================
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// ============================================
// Strict Auth Limiter (Password Reset, Email Verification)
// 5 attempts per hour
// ============================================
exports.strictAuthLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many attempts. Please try again after 1 hour.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ============================================
// Password Reset Limiter
// 3 attempts per hour
// ============================================
exports.passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset requests. Please try again after 1 hour.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => req.body.email || req.ip,
});

// ============================================
// File Upload Limiter
// 20 uploads per hour
// ============================================
exports.uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Too many file uploads. Please try again after an hour.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ============================================
// Search Rate Limiter
// 60 searches per minute
// ============================================
exports.searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: 'Too many search requests. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ============================================
// Feedback/Contact Limiter
// 5 submissions per hour
// ============================================
exports.feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many feedback submissions. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ============================================
// Session Booking Limiter
// 10 bookings per hour
// ============================================
exports.bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many booking attempts. Please try again after an hour.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ============================================
// Comment/Review Limiter
// 15 per hour
// ============================================
exports.commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: 'Too many comments posted. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ============================================
// Email Sending Limiter
// 10 emails per hour per user
// ============================================
exports.emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Email sending limit reached. Please try again after an hour.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
});

// ============================================
// Admin Actions Limiter
// 500 requests per 15 minutes for admins
// ============================================
exports.adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many admin requests. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ============================================
// Custom Rate Limiter Factory
// ============================================
exports.createLimiter = (options = {}) => {
  const defaults = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
  };

  return rateLimit({ ...defaults, ...options });
};

// ============================================
// Dynamic Rate Limiter (based on user role)
// ============================================
exports.dynamicLimiter = (req, res, next) => {
  const limits = {
    superadmin: 1000,
    admin: 500,
    mentor: 300,
    user: 200,
    guest: 100,
  };

  const userRole = req.user?.role || 'guest';
  const maxRequests = limits[userRole] || 100;

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: maxRequests,
    handler: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
  });

  limiter(req, res, next);
};