// ============================================
// EntreSkillHub - Authentication Validators
// Input validation for authentication routes
// ============================================

const { body, param, query, validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');

// ============================================
// Middleware: Handle Validation Errors
// ============================================
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
      location: err.location,
    }));

    return ApiResponse.unprocessableEntity(
      res,
      'Validation failed. Please check your input.',
      formattedErrors
    );
  }

  next();
};

// ============================================
// Custom Password Strength Validator
// ============================================
const isStrongPassword = (value) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

  if (value.length < minLength) {
    throw new Error(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    throw new Error('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    throw new Error('Password must contain at least one lowercase letter');
  }
  if (!hasNumber) {
    throw new Error('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    throw new Error('Password must contain at least one special character');
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', 'password123', 'admin', 'admin123', '12345678',
    'qwerty', 'letmein', 'welcome', '123456789',
  ];

  if (commonPasswords.includes(value.toLowerCase())) {
    throw new Error('Password is too common. Please choose a stronger password.');
  }

  return true;
};

// ============================================
// REGISTER VALIDATION
// ============================================
exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 }).withMessage('Email cannot exceed 100 characters'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .custom(isStrongPassword),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^[+]?[\d\s()-]{10,15}$/).withMessage('Please provide a valid phone number'),

  body('role')
    .optional()
    .isIn(['user', 'mentor']).withMessage('Invalid role. Must be user or mentor'),

  body('acceptTerms')
    .notEmpty().withMessage('You must accept the terms and conditions')
    .isBoolean().withMessage('Terms acceptance must be a boolean')
    .custom((value) => {
      if (value !== true) {
        throw new Error('You must accept the terms and conditions to register');
      }
      return true;
    }),

  body('referralCode')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^ESH[A-Z0-9]{4,12}$/).withMessage('Invalid referral code format'),

  handleValidationErrors,
];

// ============================================
// LOGIN VALIDATION
// ============================================
exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 1 }).withMessage('Password cannot be empty'),

  body('rememberMe')
    .optional()
    .isBoolean().withMessage('Remember me must be a boolean'),

  handleValidationErrors,
];

// ============================================
// FORGOT PASSWORD VALIDATION
// ============================================
exports.forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  handleValidationErrors,
];

// ============================================
// RESET PASSWORD VALIDATION
// ============================================
exports.resetPasswordValidation = [
  param('token')
    .notEmpty().withMessage('Reset token is required')
    .isLength({ min: 20 }).withMessage('Invalid reset token'),

  body('password')
    .notEmpty().withMessage('New password is required')
    .custom(isStrongPassword),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  handleValidationErrors,
];

// ============================================
// CHANGE PASSWORD VALIDATION
// ============================================
exports.changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .custom(isStrongPassword)
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),

  body('confirmNewPassword')
    .notEmpty().withMessage('Please confirm your new password')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  handleValidationErrors,
];

// ============================================
// EMAIL VERIFICATION VALIDATION
// ============================================
exports.verifyEmailValidation = [
  param('token')
    .notEmpty().withMessage('Verification token is required')
    .isLength({ min: 20 }).withMessage('Invalid verification token'),

  handleValidationErrors,
];

// ============================================
// RESEND VERIFICATION VALIDATION
// ============================================
exports.resendVerificationValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  handleValidationErrors,
];

// ============================================
// REFRESH TOKEN VALIDATION
// ============================================
exports.refreshTokenValidation = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required')
    .isString().withMessage('Refresh token must be a string'),

  handleValidationErrors,
];

// ============================================
// OTP VALIDATION
// ============================================
exports.otpValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('otp')
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must contain only digits'),

  handleValidationErrors,
];

// ============================================
// LOGOUT VALIDATION
// ============================================
exports.logoutValidation = [
  body('logoutAllDevices')
    .optional()
    .isBoolean().withMessage('Logout all devices must be a boolean'),

  handleValidationErrors,
];

module.exports.handleValidationErrors = handleValidationErrors;