// ============================================
// EntreSkillHub - Authentication Controller
// Registration, Login, Password Management
// ============================================

const crypto = require('crypto');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  sendTokenResponse,
  generateAccessToken,
  generateRefreshToken,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  generateOTP,
  verifyToken,
  hashString,
} = require('../utils/generateToken');
const {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOTPEmail,
} = require('../utils/sendEmail');

// ============================================
// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
// ============================================
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, referralCode } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return ApiResponse.conflict(res, 'An account with this email already exists.');
  }

  // Handle referral code
  let referredBy = null;
  if (referralCode) {
    const referrer = await User.findOne({ referralCode });
    if (referrer) {
      referredBy = referrer._id;
      referrer.referralCount += 1;
      await referrer.save({ validateBeforeSave: false });
    }
  }

  // Create user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone: phone || null,
    role: role || 'user',
    referredBy,
    metadata: {
      signupSource: req.body.signupSource || 'web',
    },
  });

  // Generate email verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send welcome email
  try {
    await sendWelcomeEmail(user);
    await sendVerificationEmail(user, verificationToken);
  } catch (emailError) {
    console.error('Email sending failed during registration:', emailError.message);
    // Don't fail registration if email fails
  }

  // Log registration
  console.log(`✅ New user registered: ${user.email} | Role: ${user.role} | ID: ${user._id}`);

  // Send token response
  return sendTokenResponse(
    user,
    201,
    res,
    'Registration successful! Please check your email to verify your account.'
  );
});

// ============================================
// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
// ============================================
exports.login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  // Find user with password
  const user = await User.findByEmailWithPassword(email);

  if (!user) {
    return ApiResponse.unauthorized(res, 'Invalid email or password.');
  }

  // Check if account is locked
  if (user.isLocked) {
    const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return ApiResponse.forbidden(
      res,
      `Account locked due to multiple failed login attempts. Try again in ${remainingTime} minutes.`
    );
  }

  // Check if account is banned
  if (user.isBanned) {
    return ApiResponse.forbidden(
      res,
      `Your account has been banned. Reason: ${user.banReason || 'Policy violation'}`
    );
  }

  // Check if account is active
  if (!user.isActive) {
    return ApiResponse.forbidden(res, 'Your account has been deactivated. Please contact support.');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    await user.incLoginAttempts();
    const attemptsLeft = 5 - (user.loginAttempts + 1);

    if (attemptsLeft > 0) {
      return ApiResponse.unauthorized(
        res,
        `Invalid email or password. ${attemptsLeft} attempts remaining.`
      );
    } else {
      return ApiResponse.forbidden(
        res,
        'Account locked due to too many failed attempts. Try again in 30 minutes.'
      );
    }
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Add login history
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const device = req.headers['sec-ch-ua-platform'] || 'Unknown';

  await user.addLoginHistory(ip, userAgent, device, req.headers['x-country-code'] || 'Unknown');

  console.log(`✅ User logged in: ${user.email} | IP: ${ip}`);

  return sendTokenResponse(user, 200, res, 'Login successful! Welcome back.');
});

// ============================================
// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
// ============================================
exports.logout = asyncHandler(async (req, res) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res.cookie('token', 'none', cookieOptions);

  console.log(`✅ User logged out: ${req.user?.email || 'Unknown'}`);

  return ApiResponse.success(res, 'Logged out successfully.');
});

// ============================================
// @desc    Get current logged-in user
// @route   GET /api/v1/auth/me
// @access  Private
// ============================================
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('skills.skill', 'name category icon')
    .populate('savedBusinessIdeas', 'title category coverImage');

  if (!user) {
    return ApiResponse.notFound(res, 'User not found.');
  }

  return ApiResponse.success(res, 'User details fetched successfully.', {
    user: user.getPublicProfile(),
  });
});

// ============================================
// @desc    Verify email address
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
// ============================================
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const hashedToken = hashString(token);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    return ApiResponse.badRequest(res, 'Invalid or expired verification token.');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;

  await user.save({ validateBeforeSave: false });

  console.log(`✅ Email verified: ${user.email}`);

  return ApiResponse.success(res, 'Email verified successfully! You can now access all features.', {
    user: user.getPublicProfile(),
  });
});

// ============================================
// @desc    Resend verification email
// @route   POST /api/v1/auth/resend-verification
// @access  Public
// ============================================
exports.resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return ApiResponse.notFound(res, 'No account found with this email.');
  }

  if (user.isEmailVerified) {
    return ApiResponse.badRequest(res, 'Email is already verified.');
  }

  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendVerificationEmail(user, verificationToken);
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return ApiResponse.serverError(res, 'Email could not be sent. Please try again.');
  }

  return ApiResponse.success(res, 'Verification email sent successfully.');
});

// ============================================
// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
// ============================================
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Don't reveal user existence for security
    return ApiResponse.success(
      res,
      'If an account exists with this email, a password reset link has been sent.'
    );
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user, resetToken);

    console.log(`🔐 Password reset requested: ${user.email}`);

    return ApiResponse.success(res, 'Password reset link sent to your email.');
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return ApiResponse.serverError(res, 'Email could not be sent. Please try again.');
  }
});

// ============================================
// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password/:token
// @access  Public
// ============================================
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = hashString(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });

  if (!user) {
    return ApiResponse.badRequest(res, 'Invalid or expired reset token.');
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  user.passwordChangedAt = Date.now();

  await user.save();

  console.log(`✅ Password reset successful: ${user.email}`);

  return sendTokenResponse(user, 200, res, 'Password reset successful! You are now logged in.');
});

// ============================================
// @desc    Change password (logged in user)
// @route   PUT /api/v1/auth/change-password
// @access  Private
// ============================================
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return ApiResponse.notFound(res, 'User not found.');
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordValid) {
    return ApiResponse.unauthorized(res, 'Current password is incorrect.');
  }

  // Check if new password is same as old
  const isSamePassword = await user.comparePassword(newPassword);
  if (isSamePassword) {
    return ApiResponse.badRequest(res, 'New password must be different from current password.');
  }

  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  await user.save();

  console.log(`✅ Password changed: ${user.email}`);

  return sendTokenResponse(user, 200, res, 'Password changed successfully!');
});

// ============================================
// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh-token
// @access  Public (with refresh token)
// ============================================
exports.refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return ApiResponse.badRequest(res, 'Refresh token is required.');
  }

  let decoded;
  try {
    decoded = await verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return ApiResponse.unauthorized(res, 'Invalid or expired refresh token.');
  }

  const user = await User.findById(decoded.id);

  if (!user || !user.isActive || user.isBanned) {
    return ApiResponse.unauthorized(res, 'User not found or inactive.');
  }

  const newAccessToken = generateAccessToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  const newRefreshToken = generateRefreshToken({ id: user._id });

  return ApiResponse.success(res, 'Token refreshed successfully.', {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    tokenType: 'Bearer',
  });
});

// ============================================
// @desc    Send OTP for verification
// @route   POST /api/v1/auth/send-otp
// @access  Public
// ============================================
exports.sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return ApiResponse.notFound(res, 'No account found with this email.');
  }

  const otp = generateOTP(6);
  const hashedOTP = hashString(otp);

  user.emailVerificationToken = hashedOTP;
  user.emailVerificationExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });

  try {
    await sendOTPEmail(user, otp);
    return ApiResponse.success(res, 'OTP sent to your email.', {
      email: user.email,
      expiresIn: '10 minutes',
    });
  } catch (error) {
    return ApiResponse.serverError(res, 'Failed to send OTP. Please try again.');
  }
});

// ============================================
// @desc    Verify OTP
// @route   POST /api/v1/auth/verify-otp
// @access  Public
// ============================================
exports.verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const hashedOTP = hashString(otp);

  const user = await User.findOne({
    email: email.toLowerCase(),
    emailVerificationToken: hashedOTP,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    return ApiResponse.badRequest(res, 'Invalid or expired OTP.');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  return sendTokenResponse(user, 200, res, 'OTP verified successfully!');
});

// ============================================
// @desc    Check authentication status
// @route   GET /api/v1/auth/check
// @access  Public
// ============================================
exports.checkAuth = asyncHandler(async (req, res) => {
  if (!req.user) {
    return ApiResponse.success(res, 'Not authenticated.', {
      isAuthenticated: false,
      user: null,
    });
  }

  return ApiResponse.success(res, 'Authenticated.', {
    isAuthenticated: true,
    user: req.user.getPublicProfile(),
  });
});