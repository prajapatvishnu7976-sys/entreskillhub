const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    phone: { type: String, trim: true, default: null },
    role: {
      type: String,
      enum: ['user', 'mentor', 'admin', 'superadmin'],
      default: 'user',
      index: true,
    },
    permissions: [{ type: String }],
    profileImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: null },
    },
    bio: { type: String, maxlength: 500, trim: true, default: '' },
    dateOfBirth: { type: Date, default: null },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'prefer_not_to_say',
    },
    location: {
      country: { type: String, trim: true, default: 'India' },
      state: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      pincode: { type: String, trim: true, default: '' },
      address: { type: String, trim: true, default: '' },
    },
    skills: [
      {
        skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
        proficiency: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
          default: 'beginner',
        },
        yearsOfExperience: { type: Number, min: 0, max: 50, default: 0 },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    interests: [{ type: String, trim: true }],
    education: {
      level: {
        type: String,
        enum: [
          'no_formal_education', 'primary', 'secondary', 'higher_secondary',
          'diploma', 'undergraduate', 'postgraduate', 'doctorate', 'other',
        ],
        default: 'other',
      },
      field: { type: String, trim: true, default: '' },
      institution: { type: String, trim: true, default: '' },
    },
    occupation: {
      current: { type: String, trim: true, default: '' },
      experience: { type: Number, min: 0, max: 60, default: 0 },
      industry: { type: String, trim: true, default: '' },
    },
    entrepreneurshipStage: {
      type: String,
      enum: ['exploring', 'planning', 'starting', 'operating', 'scaling'],
      default: 'exploring',
    },
    savedBusinessIdeas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BusinessIdea' }],
    completedRoadmaps: [
      {
        roadmap: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap' },
        completedAt: { type: Date, default: Date.now },
        completionPercentage: { type: Number, min: 0, max: 100, default: 0 },
      },
    ],
    activeRoadmaps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap' }],
    socialLinks: {
      linkedin: { type: String, trim: true, default: '' },
      twitter: { type: String, trim: true, default: '' },
      facebook: { type: String, trim: true, default: '' },
      instagram: { type: String, trim: true, default: '' },
      website: { type: String, trim: true, default: '' },
    },
    preferences: {
      language: { type: String, default: 'en' },
      notificationPreferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        inApp: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false },
      },
      theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
      currency: { type: String, default: 'INR' },
    },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: null },
    accountStatus: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'deleted'],
      default: 'active',
      index: true,
    },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpire: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpire: { type: Date, select: false },
    passwordChangedAt: { type: Date, select: false },
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    refreshTokens: [
      {
        token: { type: String, select: false },
        device: String,
        createdAt: { type: Date, default: Date.now },
        expiresAt: Date,
      },
    ],
    lastLogin: { type: Date, default: null },
    lastActive: { type: Date, default: Date.now },
    loginHistory: [
      {
        ip: String,
        userAgent: String,
        device: String,
        location: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    referralCount: { type: Number, default: 0 },
    metadata: {
      signupSource: { type: String, default: 'web' },
      lastPasswordChange: Date,
      profileCompleteness: { type: Number, min: 0, max: 100, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ email: 1, role: 1 });
userSchema.index({ createdAt: -1 });

// Virtuals - SAFE versions
userSchema.virtual('profileCompletion').get(function () {
  try {
    const fields = [
      this.name,
      this.email,
      this.phone,
      this.bio,
      this.dateOfBirth,
      this.gender && this.gender !== 'prefer_not_to_say',
      this.location?.city,
      this.location?.state,
      this.skills && this.skills.length > 0,
      this.interests && this.interests.length > 0,
      this.profileImage?.publicId,
    ];
    const filledFields = fields.filter((field) => field).length;
    return Math.round((filledFields / fields.length) * 100);
  } catch (error) {
    return 0;
  }
});

userSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const ageDiff = Date.now() - this.dateOfBirth.getTime();
  return Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
});

userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual('displayName').get(function () {
  return this.name || (this.email ? this.email.split('@')[0] : 'User');
});

// Pre-save: Hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save: Generate referral code
userSchema.pre('save', function (next) {
  if (this.isNew && !this.referralCode) {
    this.referralCode = this.generateReferralCode();
  }
  next();
});

// Pre-save: Update profile completeness
userSchema.pre('save', function (next) {
  try {
    this.metadata.profileCompleteness = this.profileCompletion || 0;
  } catch (e) {
    this.metadata.profileCompleteness = 0;
  }
  next();
});

// Instance Methods
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d', issuer: 'entreskillhub', audience: 'entreskillhub-users' }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '90d',
  });
};

userSchema.methods.generateEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
  return verificationToken;
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.generateReferralCode = function () {
  const prefix = 'ESH';
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}${random}`;
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 };
  }
  return await this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function () {
  return await this.updateOne({ $unset: { loginAttempts: 1, lockUntil: 1 } });
};

userSchema.methods.addLoginHistory = async function (ip, userAgent, device, location) {
  this.loginHistory.push({ ip, userAgent, device, location });
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10);
  }
  this.lastLogin = Date.now();
  this.lastActive = Date.now();
  return await this.save({ validateBeforeSave: false });
};

userSchema.methods.updateLastActive = async function () {
  this.lastActive = Date.now();
  return await this.save({ validateBeforeSave: false });
};

userSchema.methods.getPublicProfile = function () {
  const profile = this.toObject();
  delete profile.password;
  delete profile.emailVerificationToken;
  delete profile.emailVerificationExpire;
  delete profile.passwordResetToken;
  delete profile.passwordResetExpire;
  delete profile.passwordChangedAt;
  delete profile.loginAttempts;
  delete profile.lockUntil;
  delete profile.twoFactorSecret;
  delete profile.refreshTokens;
  delete profile.loginHistory;
  return profile;
};

// Static Methods
userSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

userSchema.statics.getUserStats = async function () {
  return await this.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
        verified: { $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] } },
      },
    },
  ]);
};

userSchema.statics.searchUsers = function (query, filters = {}) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
    ],
    ...filters,
  });
};

const User = mongoose.model('User', userSchema);
module.exports = User;