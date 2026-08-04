// ============================================
// EntreSkillHub - User Controller
// ============================================

const User = require('../models/User');
const Skill = require('../models/Skill');
const BusinessIdea = require('../models/BusinessIdea');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');

// Safe import - won't crash if cloudinary not configured
let deleteFromCloudinary;
try {
  deleteFromCloudinary = require('../config/cloudinary').deleteFromCloudinary;
} catch (e) {
  deleteFromCloudinary = async () => null;
}

// ============================================
// @desc    Get user profile by ID
// @route   GET /api/v1/users/:userId
// @access  Public/Private
// ============================================
exports.getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .populate('skills.skill', 'name category icon description')
    .populate('savedBusinessIdeas', 'title category coverImage rating')
    .populate('completedRoadmaps.roadmap', 'title category coverImage');

  if (!user) {
    return ApiResponse.notFound(res, 'User not found.');
  }

  if (!user.isActive || user.isBanned) {
    return ApiResponse.notFound(res, 'This profile is not available.');
  }

  const isOwnProfile = req.user && req.user._id.toString() === userId;

  const profile = isOwnProfile ? user.getPublicProfile() : {
    _id: user._id,
    name: user.name,
    profileImage: user.profileImage,
    bio: user.bio,
    role: user.role,
    location: {
      city: user.location?.city || '',
      state: user.location?.state || '',
      country: user.location?.country || '',
    },
    skills: user.skills,
    interests: user.interests,
    entrepreneurshipStage: user.entrepreneurshipStage,
    socialLinks: user.socialLinks,
    createdAt: user.createdAt,
  };

  return ApiResponse.success(res, 'Profile fetched successfully.', {
    user: profile,
    isOwnProfile,
  });
});

// ============================================
// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
// ============================================
exports.updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name', 'phone', 'bio', 'dateOfBirth', 'gender',
    'location', 'education', 'occupation', 'entrepreneurshipStage',
    'interests', 'socialLinks',
  ];

  const updates = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Clean up empty strings in nested objects
  if (updates.location) {
    Object.keys(updates.location).forEach((key) => {
      if (updates.location[key] === undefined) {
        updates.location[key] = '';
      }
    });
  }

  if (updates.socialLinks) {
    Object.keys(updates.socialLinks).forEach((key) => {
      if (updates.socialLinks[key] === undefined) {
        updates.socialLinks[key] = '';
      }
    });
  }

  if (updates.education) {
    Object.keys(updates.education).forEach((key) => {
      if (updates.education[key] === undefined) {
        updates.education[key] = '';
      }
    });
  }

  if (updates.occupation) {
    if (updates.occupation.experience !== undefined) {
      updates.occupation.experience = parseInt(updates.occupation.experience) || 0;
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  if (!user) {
    return ApiResponse.notFound(res, 'User not found.');
  }

  console.log(`✅ Profile updated: ${user.email}`);

  return ApiResponse.success(res, 'Profile updated successfully.', {
    user: user.getPublicProfile(),
  });
});

// ============================================
// @desc    Upload profile image
// @route   PUT /api/v1/users/profile/image
// @access  Private
// ============================================
exports.uploadProfileImage = asyncHandler(async (req, res) => {
  // Check if Cloudinary is configured
  const isCloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'your-api-key' &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_SECRET !== 'your-api-secret';

  if (!isCloudinaryConfigured) {
    return ApiResponse.badRequest(
      res,
      'Image upload requires Cloudinary setup. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your server .env file.'
    );
  }

  if (!req.file) {
    return ApiResponse.badRequest(res, 'Please upload an image file.');
  }

  try {
    const user = await User.findById(req.user._id);

    // Delete old image if exists
    if (user.profileImage && user.profileImage.publicId) {
      try {
        await deleteFromCloudinary(user.profileImage.publicId);
      } catch (error) {
        console.error('Failed to delete old profile image:', error.message);
      }
    }

    user.profileImage = {
      url: req.file.path,
      publicId: req.file.filename,
    };

    await user.save({ validateBeforeSave: false });

    console.log(`✅ Profile image updated: ${user.email}`);

    return ApiResponse.success(res, 'Profile image updated successfully.', {
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error('Upload error:', error.message);
    return ApiResponse.serverError(res, 'Failed to upload image. Please try again.');
  }
});

// ============================================
// @desc    Delete profile image
// @route   DELETE /api/v1/users/profile/image
// @access  Private
// ============================================
exports.deleteProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.profileImage && user.profileImage.publicId) {
    try {
      await deleteFromCloudinary(user.profileImage.publicId);
    } catch (error) {
      console.error('Cloudinary deletion error:', error.message);
    }
  }

  user.profileImage = {
    url: '',
    publicId: null,
  };

  await user.save({ validateBeforeSave: false });

  return ApiResponse.success(res, 'Profile image removed.');
});

// ============================================
// @desc    Update preferences
// @route   PUT /api/v1/users/preferences
// @access  Private
// ============================================
exports.updatePreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return ApiResponse.notFound(res, 'User not found.');
  }

  const currentPrefs = user.preferences ? user.preferences.toObject() : {};
  user.preferences = { ...currentPrefs, ...req.body };
  await user.save({ validateBeforeSave: false });

  return ApiResponse.success(res, 'Preferences updated successfully.', {
    preferences: user.preferences,
  });
});

// ============================================
// @desc    Add/Update user skills
// @route   POST /api/v1/users/skills
// @access  Private
// ============================================
exports.addUserSkills = asyncHandler(async (req, res) => {
  const { skills } = req.body;

  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return ApiResponse.badRequest(res, 'Please provide at least one skill.');
  }

  // Validate that all skill IDs exist
  const skillIds = skills.map((s) => s.skill);
  const existingSkills = await Skill.find({ _id: { $in: skillIds }, isActive: true });

  if (existingSkills.length === 0) {
    return ApiResponse.badRequest(res, 'No valid skills found.');
  }

  const user = await User.findById(req.user._id);

  // Merge with existing skills
  skills.forEach((newSkill) => {
    const existingIndex = user.skills.findIndex(
      (s) => s.skill && s.skill.toString() === newSkill.skill.toString()
    );

    if (existingIndex !== -1) {
      user.skills[existingIndex].proficiency = newSkill.proficiency || user.skills[existingIndex].proficiency;
      user.skills[existingIndex].yearsOfExperience = newSkill.yearsOfExperience || user.skills[existingIndex].yearsOfExperience;
    } else {
      user.skills.push(newSkill);
    }
  });

  await user.save();

  const updatedUser = await User.findById(user._id).populate('skills.skill', 'name category icon');

  return ApiResponse.success(res, 'Skills updated successfully.', {
    skills: updatedUser.skills,
  });
});

// ============================================
// @desc    Remove skill from user
// @route   DELETE /api/v1/users/skills/:skillId
// @access  Private
// ============================================
exports.removeUserSkill = asyncHandler(async (req, res) => {
  const { skillId } = req.params;

  const user = await User.findById(req.user._id);
  user.skills = user.skills.filter((s) => s.skill && s.skill.toString() !== skillId);
  await user.save();

  return ApiResponse.success(res, 'Skill removed successfully.');
});

// ============================================
// @desc    Update interests
// @route   PUT /api/v1/users/interests
// @access  Private
// ============================================
exports.updateInterests = asyncHandler(async (req, res) => {
  const { interests } = req.body;

  if (!Array.isArray(interests)) {
    return ApiResponse.badRequest(res, 'Interests must be an array.');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { interests: interests.slice(0, 20) },
    { new: true }
  );

  return ApiResponse.success(res, 'Interests updated successfully.', {
    interests: user.interests,
  });
});

// ============================================
// @desc    Get user's saved business ideas
// @route   GET /api/v1/users/saved-businesses
// @access  Private
// ============================================
exports.getSavedBusinesses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'savedBusinessIdeas',
    match: { isActive: true, status: 'approved' },
    select: 'title shortDescription category coverImage investment difficulty rating stats slug',
  });

  return ApiResponse.success(res, 'Saved businesses fetched.', {
    savedBusinesses: user.savedBusinessIdeas || [],
    total: (user.savedBusinessIdeas || []).length,
  });
});

// ============================================
// @desc    Save/Unsave business idea
// @route   POST /api/v1/users/save-business/:businessId
// @access  Private
// ============================================
exports.toggleSaveBusiness = asyncHandler(async (req, res) => {
  const { businessId } = req.params;

  const business = await BusinessIdea.findById(businessId);
  if (!business) {
    return ApiResponse.notFound(res, 'Business idea not found.');
  }

  const user = await User.findById(req.user._id);
  const savedIds = (user.savedBusinessIdeas || []).map((id) => id.toString());
  const isAlreadySaved = savedIds.includes(businessId);

  if (isAlreadySaved) {
    user.savedBusinessIdeas = user.savedBusinessIdeas.filter(
      (id) => id.toString() !== businessId
    );
    business.stats.bookmarkCount = Math.max(0, (business.stats.bookmarkCount || 0) - 1);
  } else {
    user.savedBusinessIdeas.push(businessId);
    business.stats.bookmarkCount = (business.stats.bookmarkCount || 0) + 1;
  }

  await user.save();
  await business.save({ validateBeforeSave: false });

  return ApiResponse.success(
    res,
    isAlreadySaved ? 'Business idea removed from saved list.' : 'Business idea saved!',
    { isSaved: !isAlreadySaved }
  );
});

// ============================================
// @desc    Get user dashboard stats
// @route   GET /api/v1/users/dashboard-stats
// @access  Private
// ============================================
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const stats = {
    profileCompletion: user.metadata?.profileCompleteness || 0,
    totalSkills: (user.skills || []).length,
    totalInterests: (user.interests || []).length,
    savedBusinesses: (user.savedBusinessIdeas || []).length,
    activeRoadmaps: (user.activeRoadmaps || []).length,
    completedRoadmaps: (user.completedRoadmaps || []).length,
    entrepreneurshipStage: user.entrepreneurshipStage,
    referralCount: user.referralCount || 0,
    memberSince: user.createdAt,
  };

  return ApiResponse.success(res, 'Dashboard stats fetched.', { stats });
});

// ============================================
// @desc    Search users
// @route   GET /api/v1/users/search
// @access  Public
// ============================================
exports.searchUsers = asyncHandler(async (req, res) => {
  const {
    q = '',
    role,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const filter = { isActive: true, isBanned: false };

  if (role) filter.role = role;

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { 'location.city': { $regex: q, $options: 'i' } },
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('name email profileImage role bio location createdAt')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, 'Users fetched.', users, {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total,
    itemsPerPage: parseInt(limit),
    hasNext: skip + users.length < total,
    hasPrev: parseInt(page) > 1,
  });
});

// ============================================
// @desc    Delete user account
// @route   DELETE /api/v1/users/account
// @access  Private
// ============================================
exports.deleteAccount = asyncHandler(async (req, res) => {
  const { password, reason } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return ApiResponse.unauthorized(res, 'Incorrect password.');
  }

  // Soft delete
  user.isActive = false;
  user.accountStatus = 'deleted';
  user.email = `deleted_${Date.now()}_${user.email}`;
  await user.save({ validateBeforeSave: false });

  console.log(`❌ Account deleted: ${req.user.email} | Reason: ${reason || 'Not provided'}`);

  return ApiResponse.success(res, 'Account deleted successfully.');
});

// ============================================
// @desc    Get login history
// @route   GET /api/v1/users/login-history
// @access  Private
// ============================================
exports.getLoginHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('loginHistory lastLogin');

  return ApiResponse.success(res, 'Login history fetched.', {
    history: (user.loginHistory || []).reverse(),
    lastLogin: user.lastLogin,
  });
});

// ============================================
// @desc    Get referral info
// @route   GET /api/v1/users/referral
// @access  Private
// ============================================
exports.getReferralInfo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('referralCode referralCount');

  const referredUsers = await User.find({ referredBy: req.user._id })
    .select('name email createdAt isEmailVerified')
    .sort({ createdAt: -1 })
    .limit(20);

  return ApiResponse.success(res, 'Referral info fetched.', {
    referralCode: user.referralCode,
    referralUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/register?ref=${user.referralCode}`,
    totalReferrals: user.referralCount || 0,
    referredUsers,
  });
});

// ============================================
// @desc    Get user activity feed
// @route   GET /api/v1/users/activity
// @access  Private
// ============================================
exports.getActivityFeed = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, 'Activity feed fetched.', {
    recentProgress: [],
    recentBookmarks: [],
  });
});