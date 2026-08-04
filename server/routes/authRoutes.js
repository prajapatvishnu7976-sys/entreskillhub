// ============================================
// EntreSkillHub - Authentication Routes
// ============================================

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { protect, optionalAuth } = require('../middleware/auth');
const {
  authLimiter,
  strictAuthLimiter,
  passwordResetLimiter,
} = require('../middleware/rateLimiter');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  verifyEmailValidation,
  resendVerificationValidation,
  refreshTokenValidation,
  otpValidation,
} = require('../validators/authValidator');

// ============================================
// Public Routes
// ============================================

// Registration
router.post('/register', authLimiter, registerValidation, authController.register);

// Login
router.post('/login', authLimiter, loginValidation, authController.login);

// Email Verification
router.get('/verify-email/:token', verifyEmailValidation, authController.verifyEmail);
router.post(
  '/resend-verification',
  strictAuthLimiter,
  resendVerificationValidation,
  authController.resendVerification
);

// Forgot / Reset Password
router.post(
  '/forgot-password',
  passwordResetLimiter,
  forgotPasswordValidation,
  authController.forgotPassword
);
router.put(
  '/reset-password/:token',
  passwordResetLimiter,
  resetPasswordValidation,
  authController.resetPassword
);

// OTP
router.post('/send-otp', strictAuthLimiter, forgotPasswordValidation, authController.sendOTP);
router.post('/verify-otp', authLimiter, otpValidation, authController.verifyOTP);

// Refresh Token
router.post('/refresh-token', refreshTokenValidation, authController.refreshAccessToken);

// Check Auth Status
router.get('/check', optionalAuth, authController.checkAuth);

// ============================================
// Private Routes
// ============================================

router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);
router.put(
  '/change-password',
  protect,
  changePasswordValidation,
  authController.changePassword
);

module.exports = router;