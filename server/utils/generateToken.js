// ============================================
// EntreSkillHub - Token Generation Utility
// JWT tokens, verification tokens, unique IDs
// ============================================

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ============================================
// Generate JWT Access Token
// ============================================
exports.generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
    issuer: 'entreskillhub',
    audience: 'entreskillhub-users',
  });
};

// ============================================
// Generate JWT Refresh Token
// ============================================
exports.generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '90d',
  });
};

// ============================================
// Generate Token Pair (Access + Refresh)
// ============================================
exports.generateTokenPair = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = exports.generateAccessToken(payload);
  const refreshToken = exports.generateRefreshToken({ id: user._id });

  return { accessToken, refreshToken };
};

// ============================================
// Send Token as Response (with Cookie)
// ============================================
exports.sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const { accessToken, refreshToken } = exports.generateTokenPair(user);

  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  // Set cookie
  res.cookie('token', accessToken, cookieOptions);

  // Prepare safe user object (remove sensitive fields)
  const userResponse = user.toObject ? user.toObject() : user;
  delete userResponse.password;
  delete userResponse.emailVerificationToken;
  delete userResponse.passwordResetToken;
  delete userResponse.loginAttempts;
  delete userResponse.lockUntil;
  delete userResponse.twoFactorSecret;

  return res.status(statusCode).json({
    success: true,
    status: 'success',
    statusCode,
    message,
    data: {
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: process.env.JWT_EXPIRE || '30d',
      },
    },
    timestamp: new Date().toISOString(),
  });
};

// ============================================
// Verify JWT Token
// ============================================
exports.verifyToken = (token, secret = process.env.JWT_SECRET) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
};

// ============================================
// Decode Token (without verification)
// ============================================
exports.decodeToken = (token) => {
  return jwt.decode(token);
};

// ============================================
// Generate Random Token (for email verification, password reset)
// ============================================
exports.generateRandomToken = (bytes = 32) => {
  const token = crypto.randomBytes(bytes).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  return {
    token, // Plain token to send via email
    hashedToken, // Hashed token to store in database
  };
};

// ============================================
// Generate OTP (6-digit)
// ============================================
exports.generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  return otp;
};

// ============================================
// Generate Unique Identifier
// ============================================
exports.generateUniqueId = (prefix = '', length = 8) => {
  const random = crypto.randomBytes(length).toString('hex').toUpperCase();
  return prefix ? `${prefix}-${random}` : random;
};

// ============================================
// Generate Referral Code
// ============================================
exports.generateReferralCode = () => {
  const prefix = 'ESH';
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// ============================================
// Generate Session ID
// ============================================
exports.generateSessionId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SES-${timestamp}-${random}`;
};

// ============================================
// Generate Certificate ID
// ============================================
exports.generateCertificateId = () => {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `ESH-CERT-${year}-${random}`;
};

// ============================================
// Generate Invoice Number
// ============================================
exports.generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `INV-${year}${month}-${random}`;
};

// ============================================
// Generate API Key
// ============================================
exports.generateApiKey = () => {
  const prefix = 'esh_';
  const key = crypto.randomBytes(32).toString('base64url');
  return `${prefix}${key}`;
};

// ============================================
// Generate Share Token (for shareable links)
// ============================================
exports.generateShareToken = (bytes = 16) => {
  return crypto.randomBytes(bytes).toString('hex');
};

// ============================================
// Hash a string (for tokens)
// ============================================
exports.hashString = (str, algorithm = 'sha256') => {
  return crypto.createHash(algorithm).update(str).digest('hex');
};

// ============================================
// Generate Password Reset Token with Expiry
// ============================================
exports.generatePasswordResetToken = () => {
  const { token, hashedToken } = exports.generateRandomToken(32);
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  return { token, hashedToken, expiresAt };
};

// ============================================
// Generate Email Verification Token
// ============================================
exports.generateEmailVerificationToken = () => {
  const { token, hashedToken } = exports.generateRandomToken(32);
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return { token, hashedToken, expiresAt };
};

// ============================================
// Generate 2FA Backup Codes
// ============================================
exports.generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
  }
  return codes;
};

// ============================================
// Verify Token Freshness
// ============================================
exports.isTokenFresh = (issuedAt, maxAgeSeconds = 3600) => {
  const now = Math.floor(Date.now() / 1000);
  return now - issuedAt <= maxAgeSeconds;
};