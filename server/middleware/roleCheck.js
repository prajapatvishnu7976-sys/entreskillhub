// ============================================
// EntreSkillHub - Role-Based Access Control
// Middleware for authorization based on roles
// ============================================

const ApiResponse = require('../utils/apiResponse');

// ============================================
// Restrict to specific roles
// Usage: restrictTo('admin', 'superadmin')
// ============================================
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Please login to access this resource.');
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        res,
        `Access denied. This resource requires one of the following roles: ${roles.join(', ')}`
      );
    }

    next();
  };
};

// ============================================
// Admin Only Access
// ============================================
exports.adminOnly = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.unauthorized(res, 'Please login first.');
  }

  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return ApiResponse.forbidden(res, 'Admin access required.');
  }

  next();
};

// ============================================
// Super Admin Only
// ============================================
exports.superAdminOnly = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.unauthorized(res, 'Please login first.');
  }

  if (req.user.role !== 'superadmin') {
    return ApiResponse.forbidden(res, 'Super Admin access required.');
  }

  next();
};

// ============================================
// Mentor or Admin
// ============================================
exports.mentorOrAdmin = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.unauthorized(res, 'Please login first.');
  }

  if (!['mentor', 'admin', 'superadmin'].includes(req.user.role)) {
    return ApiResponse.forbidden(res, 'Mentor or Admin access required.');
  }

  next();
};

// ============================================
// User Only (not mentor/admin)
// ============================================
exports.userOnly = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.unauthorized(res, 'Please login first.');
  }

  if (req.user.role !== 'user') {
    return ApiResponse.forbidden(res, 'This action is only available for regular users.');
  }

  next();
};

// ============================================
// Check Specific Permission
// ============================================
exports.requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Please login first.');
    }

    // Super admin has all permissions
    if (req.user.role === 'superadmin') {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.some((p) => userPermissions.includes(p));

    if (!hasPermission) {
      return ApiResponse.forbidden(
        res,
        `Missing required permission. Needed: ${permissions.join(' or ')}`
      );
    }

    next();
  };
};

// ============================================
// Check Multiple Roles with Custom Logic
// ============================================
exports.hasAnyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Please login first.');
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, `Requires role: ${roles.join(' or ')}`);
    }

    next();
  };
};

// ============================================
// Verify Own Resource or Admin
// ============================================
exports.ownerOrAdmin = (userIdField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Please login first.');
    }

    const resourceUserId = req.resource?.[userIdField]?.toString() || req.params.userId;
    const requesterId = req.user._id.toString();

    // Admin bypass
    if (['admin', 'superadmin'].includes(req.user.role)) {
      return next();
    }

    if (resourceUserId !== requesterId) {
      return ApiResponse.forbidden(res, 'You can only access your own resources.');
    }

    next();
  };
};

// ============================================
// Check Verified Mentor Status
// ============================================
exports.verifiedMentorOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Please login first.');
    }

    if (req.user.role !== 'mentor') {
      return ApiResponse.forbidden(res, 'Mentor account required.');
    }

    const Mentor = require('../models/Mentor');
    const mentor = await Mentor.findOne({ user: req.user._id });

    if (!mentor) {
      return ApiResponse.forbidden(res, 'Mentor profile not found.');
    }

    if (mentor.verification.status !== 'verified') {
      return ApiResponse.forbidden(res, 'Your mentor account is not verified yet.');
    }

    req.mentor = mentor;
    next();
  } catch (error) {
    console.error('Verified mentor check error:', error.message);
    return ApiResponse.serverError(res, 'Verification check failed.');
  }
};

// ============================================
// Access Level Hierarchy
// ============================================
const ROLE_HIERARCHY = {
  user: 1,
  mentor: 2,
  admin: 3,
  superadmin: 4,
};

exports.requireMinimumRole = (minimumRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Please login first.');
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;

    if (userLevel < requiredLevel) {
      return ApiResponse.forbidden(res, `Minimum role required: ${minimumRole}`);
    }

    next();
  };
};