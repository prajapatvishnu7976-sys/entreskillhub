// ============================================
// EntreSkillHub - Authentication Middleware
// JWT verification and user authentication
// ============================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

// ============================================
// Extract Token from Request
// ============================================
const extractToken = (req) => {
  let token = null;

  // From Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // From cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // From query parameter (for special cases like email verification)
  else if (req.query && req.query.token) {
    token = req.query.token;
  }

  return token;
};

// ============================================
// Verify JWT Token
// ============================================
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        issuer: 'entreskillhub',
        audience: 'entreskillhub-users',
      },
      (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      }
    );
  });
};

// ============================================
// Main Authentication Middleware (Required)
// Protects routes - user MUST be logged in
// ============================================
exports.protect = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return ApiResponse.unauthorized(res, 'Access denied. Please login to continue.');
    }

    // Verify token
    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return ApiResponse.unauthorized(res, 'Session expired. Please login again.');
      } else if (error.name === 'JsonWebTokenError') {
        return ApiResponse.unauthorized(res, 'Invalid token. Please login again.');
      }
      return ApiResponse.unauthorized(res, 'Authentication failed.');
    }

    // Fetch user from database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return ApiResponse.unauthorized(res, 'User not found. Please login again.');
    }

    // Check if user is active
    if (!user.isActive) {
      return ApiResponse.forbidden(res, 'Your account has been deactivated. Please contact support.');
    }

    // Check if user is banned
    if (user.isBanned) {
      return ApiResponse.forbidden(
        res,
        `Your account has been banned. Reason: ${user.banReason || 'Policy violation'}`
      );
    }

    // Check if account is locked
    if (user.isLocked) {
      return ApiResponse.forbidden(
        res,
        'Account locked due to multiple failed login attempts. Try again later.'
      );
    }

    // Check if password was changed after token was issued
    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
      return ApiResponse.unauthorized(res, 'Password was recently changed. Please login again.');
    }

    // Update last active timestamp (async, don't wait)
    user.updateLastActive().catch((err) => console.error('Failed to update last active:', err.message));

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    req.token = token;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return ApiResponse.serverError(res, 'Authentication error occurred.');
  }
};

// ============================================
// Optional Authentication
// User can be logged in OR not - doesn't fail
// ============================================
exports.optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = await verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');

      if (user && user.isActive && !user.isBanned) {
        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;
      } else {
        req.user = null;
      }
    } catch (error) {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// ============================================
// Verify Email Verified
// ============================================
exports.requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.unauthorized(res, 'Please login first.');
  }

  if (!req.user.isEmailVerified) {
    return ApiResponse.forbidden(
      res,
      'Please verify your email address to access this resource.'
    );
  }

  next();
};

// ============================================
// Verify Refresh Token
// ============================================
exports.verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ApiResponse.badRequest(res, 'Refresh token is required.');
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return ApiResponse.unauthorized(res, 'Invalid or expired refresh token.');
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return ApiResponse.unauthorized(res, 'User not found or inactive.');
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.error('Refresh token error:', error.message);
    return ApiResponse.serverError(res, 'Token verification failed.');
  }
};

// ============================================
// Check Ownership
// Ensures user owns the resource
// ============================================
exports.checkOwnership = (resourceModel, resourceIdParam = 'id', userField = 'user') => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${resourceModel}`);
      const resourceId = req.params[resourceIdParam];

      const resource = await Model.findById(resourceId);

      if (!resource) {
        return ApiResponse.notFound(res, `${resourceModel} not found.`);
      }

      const ownerId = resource[userField]?.toString();
      const requesterId = req.user._id.toString();

      // Admin bypass
      if (['admin', 'superadmin'].includes(req.user.role)) {
        req.resource = resource;
        return next();
      }

      if (ownerId !== requesterId) {
        return ApiResponse.forbidden(res, 'You do not have permission to access this resource.');
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error.message);
      return ApiResponse.serverError(res, 'Authorization check failed.');
    }
  };
};

// ============================================
// Rate Limit User Actions
// Prevents rapid-fire actions
// ============================================
const userActionMap = new Map();

exports.rateLimitAction = (actionKey, maxAttempts = 5, windowMs = 60000) => {
  return (req, res, next) => {
    const userId = req.user?._id?.toString() || req.ip;
    const key = `${userId}:${actionKey}`;
    const now = Date.now();

    let userData = userActionMap.get(key);

    if (!userData || now - userData.firstAttempt > windowMs) {
      userData = { count: 1, firstAttempt: now };
      userActionMap.set(key, userData);
      return next();
    }

    userData.count += 1;

    if (userData.count > maxAttempts) {
      const remainingTime = Math.ceil((windowMs - (now - userData.firstAttempt)) / 1000);
      return ApiResponse.tooManyRequests(
        res,
        `Too many attempts. Please try again in ${remainingTime} seconds.`
      );
    }

    userActionMap.set(key, userData);
    next();
  };
};

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of userActionMap.entries()) {
    if (now - value.firstAttempt > 3600000) {
      userActionMap.delete(key);
    }
  }
}, 3600000);

// ============================================
// Verify User is Mentor
// ============================================
exports.requireMentor = async (req, res, next) => {
  try {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Please login first.');
    }

    if (req.user.role !== 'mentor') {
      return ApiResponse.forbidden(res, 'Access denied. Mentor account required.');
    }

    // Check if mentor profile exists
    const Mentor = require('../models/Mentor');
    const mentor = await Mentor.findOne({ user: req.user._id });

    if (!mentor) {
      return ApiResponse.forbidden(res, 'Please complete your mentor profile first.');
    }

    if (mentor.verification.status !== 'verified') {
      return ApiResponse.forbidden(res, 'Your mentor account is not yet verified.');
    }

    req.mentor = mentor;
    next();
  } catch (error) {
    console.error('Mentor check error:', error.message);
    return ApiResponse.serverError(res, 'Mentor verification failed.');
  }
};

// ============================================
// Log User Activity
// ============================================
exports.logActivity = (activityType) => {
  return (req, res, next) => {
    if (req.user) {
      console.log(
        `[Activity] User: ${req.user._id} | Action: ${activityType} | IP: ${req.ip} | Time: ${new Date().toISOString()}`
      );
    }
    next();
  };
};