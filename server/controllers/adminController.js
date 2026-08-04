// ============================================
// EntreSkillHub - Admin Controller
// Platform management, user management, moderation
// ============================================

const User = require('../models/User');
const Mentor = require('../models/Mentor');
const BusinessIdea = require('../models/BusinessIdea');
const Roadmap = require('../models/Roadmap');
const LearningResource = require('../models/LearningResource');
const MentorSession = require('../models/MentorSession');
const Feedback = require('../models/Feedback');
const Progress = require('../models/Progress');
const Skill = require('../models/Skill');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');

// ============================================
// @desc    Get admin dashboard overview
// @route   GET /api/v1/admin/dashboard
// @access  Private (Admin)
// ============================================
exports.getAdminDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalUsers, totalMentors, totalBusinessIdeas, totalRoadmaps,
    totalResources, totalSessions, totalFeedback,
    newUsersToday, newUsersThisMonth, newUsersLastMonth,
    pendingMentors, pendingBusinessIdeas, pendingResources, pendingFeedback,
    completedSessions, activeUsersLastWeek, totalRevenue,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Mentor.countDocuments({ isActive: true, 'verification.status': 'verified' }),
    BusinessIdea.countDocuments({ isActive: true, status: 'approved' }),
    Roadmap.countDocuments({ isActive: true, status: 'approved' }),
    LearningResource.countDocuments({ isActive: true, status: 'approved' }),
    MentorSession.countDocuments(),
    Feedback.countDocuments(),
    User.countDocuments({ createdAt: { $gte: todayStart } }),
    User.countDocuments({ createdAt: { $gte: thisMonthStart } }),
    User.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    Mentor.countDocuments({ 'verification.status': 'pending' }),
    BusinessIdea.countDocuments({ status: 'pending_review' }),
    LearningResource.countDocuments({ status: 'pending_review' }),
    Feedback.countDocuments({ status: { $in: ['new', 'acknowledged'] } }),
    MentorSession.countDocuments({ status: 'completed' }),
    User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }),
    MentorSession.aggregate([
      { $match: { 'payment.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.platformFee' } } },
    ]),
  ]);

  // Calculate user growth
  const userGrowth = newUsersLastMonth > 0
    ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100)
    : 100;

  return ApiResponse.success(res, 'Admin dashboard fetched.', {
    overview: {
      totalUsers,
      totalMentors,
      totalBusinessIdeas,
      totalRoadmaps,
      totalResources,
      totalSessions,
      totalFeedback,
      activeUsersLastWeek,
      totalRevenue: totalRevenue[0]?.total || 0,
    },
    growth: {
      newUsersToday,
      newUsersThisMonth,
      newUsersLastMonth,
      userGrowthPercent: userGrowth,
    },
    pending: {
      mentors: pendingMentors,
      businessIdeas: pendingBusinessIdeas,
      resources: pendingResources,
      feedback: pendingFeedback,
      total: pendingMentors + pendingBusinessIdeas + pendingResources + pendingFeedback,
    },
    activity: {
      completedSessions,
      activeUsersLastWeek,
    },
  });
});

// ============================================
// @desc    Get all users (with filters)
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
// ============================================
exports.getAllUsers = asyncHandler(async (req, res) => {
  const {
    q, role, status, isEmailVerified,
    startDate, endDate, page = 1, limit = 20,
    sortBy = 'createdAt', sortOrder = 'desc',
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const filter = {};

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
    ];
  }

  if (role) filter.role = role;
  if (status) filter.accountStatus = status;
  if (isEmailVerified !== undefined) filter.isEmailVerified = isEmailVerified === 'true';

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password -emailVerificationToken -passwordResetToken -twoFactorSecret -refreshTokens'),
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
// @desc    Get user details (Admin)
// @route   GET /api/v1/admin/users/:userId
// @access  Private (Admin)
// ============================================
exports.getUserDetails = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .populate('skills.skill', 'name category')
    .populate('savedBusinessIdeas', 'title category');

  if (!user) {
    return ApiResponse.notFound(res, 'User not found.');
  }

  const [progressStats, sessionsCount, feedbackCount, isMentor] = await Promise.all([
    Progress.getUserStats(userId),
    MentorSession.countDocuments({ mentee: userId }),
    Feedback.countDocuments({ user: userId }),
    Mentor.findOne({ user: userId }),
  ]);

  return ApiResponse.success(res, 'User details fetched.', {
    user: user.getPublicProfile(),
    stats: {
      progress: progressStats,
      totalSessions: sessionsCount,
      totalFeedback: feedbackCount,
      isMentor: !!isMentor,
      mentorId: isMentor?._id || null,
    },
  });
});

// ============================================
// @desc    Update user status (Admin)
// @route   PUT /api/v1/admin/users/:userId/status
// @access  Private (Admin)
// ============================================
exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status, reason } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return ApiResponse.notFound(res, 'User not found.');
  }

  // Prevent deactivating other admins
  if (['admin', 'superadmin'].includes(user.role) && req.user.role !== 'superadmin') {
    return ApiResponse.forbidden(res, 'Only super admins can modify admin accounts.');
  }

  user.accountStatus = status;
  user.isActive = status === 'active';

  await user.save({ validateBeforeSave: false });

  console.log(`✅ User status updated: ${user.email} → ${status} by ${req.user.email}`);

  return ApiResponse.success(res, `User status updated to ${status}.`, { user });
});

// ============================================
// @desc    Ban/Unban user (Admin)
// @route   PUT /api/v1/admin/users/:userId/ban
// @access  Private (Admin)
// ============================================
exports.banUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isBanned, reason } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return ApiResponse.notFound(res, 'User not found.');
  }

  if (['admin', 'superadmin'].includes(user.role)) {
    return ApiResponse.forbidden(res, 'Cannot ban admin accounts.');
  }

  user.isBanned = isBanned;
  user.banReason = isBanned ? reason : null;
  user.isActive = !isBanned;

  await user.save({ validateBeforeSave: false });

  console.log(`${isBanned ? '🚫' : '✅'} User ${isBanned ? 'banned' : 'unbanned'}: ${user.email}`);

  return ApiResponse.success(res, isBanned ? 'User banned successfully.' : 'User unbanned.', {
    user,
  });
});

// ============================================
// @desc    Change user role (Admin)
// @route   PUT /api/v1/admin/users/:userId/role
// @access  Private (SuperAdmin)
// ============================================
exports.changeUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  const validRoles = ['user', 'mentor', 'admin'];
  if (!validRoles.includes(role)) {
    return ApiResponse.badRequest(res, 'Invalid role.');
  }

  // Only superadmin can promote to admin
  if (role === 'admin' && req.user.role !== 'superadmin') {
    return ApiResponse.forbidden(res, 'Only super admins can promote users to admin.');
  }

  const user = await User.findByIdAndUpdate(userId, { role }, { new: true });

  if (!user) {
    return ApiResponse.notFound(res, 'User not found.');
  }

  console.log(`✅ User role changed: ${user.email} → ${role} by ${req.user.email}`);

  return ApiResponse.success(res, `User role updated to ${role}.`, { user });
});

// ============================================
// @desc    Delete user (Admin)
// @route   DELETE /api/v1/admin/users/:userId
// @access  Private (SuperAdmin)
// ============================================
exports.deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return ApiResponse.notFound(res, 'User not found.');
  }

  if (['admin', 'superadmin'].includes(user.role)) {
    return ApiResponse.forbidden(res, 'Cannot delete admin accounts.');
  }

  // Soft delete
  user.isActive = false;
  user.accountStatus = 'deleted';
  user.email = `deleted_${Date.now()}_${user.email}`;
  await user.save({ validateBeforeSave: false });

  console.log(`❌ User deleted by admin: ${user.email} by ${req.user.email}`);

  return ApiResponse.success(res, 'User deleted successfully.');
});

// ============================================
// @desc    Get platform analytics
// @route   GET /api/v1/admin/analytics
// @access  Private (Admin)
// ============================================
exports.getPlatformAnalytics = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;

  const daysMap = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 };
  const days = daysMap[period] || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [
    usersByRole, userSignupsOverTime, sessionsByStatus,
    topBusinessIdeas, topMentors, revenueOverTime,
    engagementStats, contentStats,
  ] = await Promise.all([
    // Users by role
    User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]),

    // User signups over time
    User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Sessions by status
    MentorSession.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Top business ideas
    BusinessIdea.find({ isActive: true, status: 'approved' })
      .sort({ 'stats.viewCount': -1 })
      .limit(10)
      .select('title category stats rating'),

    // Top mentors
    Mentor.find({ isActive: true, 'verification.status': 'verified' })
      .sort({ 'rating.average': -1, 'stats.completedSessions': -1 })
      .limit(10)
      .populate('user', 'name profileImage')
      .select('title rating stats mentorLevel'),

    // Revenue over time
    MentorSession.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          'payment.status': 'completed',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$pricing.platformFee' },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Engagement stats
    Progress.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalEnrollments: { $sum: 1 },
          totalCompletions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          avgCompletionRate: { $avg: '$completionPercentage' },
          totalTimeSpent: { $sum: '$totalTimeSpent' },
        },
      },
    ]),

    // Content stats
    Promise.all([
      BusinessIdea.countDocuments({ createdAt: { $gte: startDate } }),
      Roadmap.countDocuments({ createdAt: { $gte: startDate } }),
      LearningResource.countDocuments({ createdAt: { $gte: startDate } }),
    ]).then(([businessIdeas, roadmaps, resources]) => ({
      businessIdeas, roadmaps, resources,
    })),
  ]);

  return ApiResponse.success(res, 'Analytics fetched.', {
    period,
    startDate,
    usersByRole,
    userSignupsOverTime,
    sessionsByStatus,
    topBusinessIdeas,
    topMentors,
    revenueOverTime,
    engagement: engagementStats[0] || {},
    contentCreated: contentStats,
  });
});

// ============================================
// @desc    Get all content for moderation
// @route   GET /api/v1/admin/content/pending
// @access  Private (Admin)
// ============================================
exports.getPendingContent = asyncHandler(async (req, res) => {
  const [pendingBusinessIdeas, pendingResources, pendingMentors] = await Promise.all([
    BusinessIdea.find({ status: 'pending_review' })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(20),
    LearningResource.find({ status: 'pending_review' })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(20),
    Mentor.find({ 'verification.status': 'pending' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(20),
  ]);

  return ApiResponse.success(res, 'Pending content fetched.', {
    businessIdeas: pendingBusinessIdeas,
    resources: pendingResources,
    mentors: pendingMentors,
    total: pendingBusinessIdeas.length + pendingResources.length + pendingMentors.length,
  });
});

// ============================================
// @desc    Get reported content
// @route   GET /api/v1/admin/content/reported
// @access  Private (Admin)
// ============================================
exports.getReportedContent = asyncHandler(async (req, res) => {
  const [reportedResources, reportedMentors] = await Promise.all([
    LearningResource.find({ reportCount: { $gt: 0 } })
      .populate('uploadedBy', 'name email')
      .sort({ reportCount: -1 })
      .limit(20)
      .select('title reportCount reports stats'),
    Mentor.find({ reportCount: { $gt: 0 } })
      .populate('user', 'name email')
      .sort({ reportCount: -1 })
      .limit(20)
      .select('title reportCount reports rating'),
  ]);

  return ApiResponse.success(res, 'Reported content fetched.', {
    resources: reportedResources,
    mentors: reportedMentors,
    total: reportedResources.length + reportedMentors.length,
  });
});

// ============================================
// @desc    Toggle feature status of content
// @route   PUT /api/v1/admin/content/:type/:id/feature
// @access  Private (Admin)
// ============================================
exports.toggleFeatureContent = asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const { isFeatured } = req.body;

  const models = {
    'business-idea': BusinessIdea,
    'roadmap': Roadmap,
    'resource': LearningResource,
    'mentor': Mentor,
    'skill': Skill,
  };

  const Model = models[type];
  if (!Model) {
    return ApiResponse.badRequest(res, 'Invalid content type.');
  }

  const content = await Model.findById(id);
  if (!content) {
    return ApiResponse.notFound(res, 'Content not found.');
  }

  content.isFeatured = isFeatured;
  await content.save();

  return ApiResponse.success(res, `Content ${isFeatured ? 'featured' : 'unfeatured'}.`, { content });
});

// ============================================
// @desc    Get platform statistics
// @route   GET /api/v1/admin/stats
// @access  Private (Admin)
// ============================================
exports.getPlatformStats = asyncHandler(async (req, res) => {
  const [userStats, sessionStats, feedbackStats, financialStats] = await Promise.all([
    User.getUserStats(),
    MentorSession.getStats(),
    Feedback.getStats(),
    MentorSession.aggregate([
      { $match: { 'payment.status': 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.finalAmount' },
          totalPlatformFee: { $sum: '$pricing.platformFee' },
          totalMentorEarnings: { $sum: '$pricing.mentorEarnings' },
          totalSessions: { $sum: 1 },
          avgSessionValue: { $avg: '$pricing.finalAmount' },
        },
      },
    ]),
  ]);

  return ApiResponse.success(res, 'Platform statistics fetched.', {
    users: userStats,
    sessions: sessionStats,
    feedback: feedbackStats,
    financials: financialStats[0] || {},
  });
});

// ============================================
// @desc    Bulk actions on users
// @route   POST /api/v1/admin/users/bulk-action
// @access  Private (Admin)
// ============================================
exports.bulkUserAction = asyncHandler(async (req, res) => {
  const { userIds, action, reason } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return ApiResponse.badRequest(res, 'Please provide user IDs.');
  }

  let updateData = {};

  switch (action) {
    case 'activate':
      updateData = { isActive: true, accountStatus: 'active' };
      break;
    case 'deactivate':
      updateData = { isActive: false, accountStatus: 'inactive' };
      break;
    case 'ban':
      updateData = { isBanned: true, banReason: reason, isActive: false };
      break;
    case 'unban':
      updateData = { isBanned: false, banReason: null, isActive: true };
      break;
    case 'verify_email':
      updateData = { isEmailVerified: true };
      break;
    default:
      return ApiResponse.badRequest(res, 'Invalid action.');
  }

  // Exclude admin accounts
  const result = await User.updateMany(
    { _id: { $in: userIds }, role: { $nin: ['admin', 'superadmin'] } },
    updateData
  );

  console.log(`✅ Bulk action: ${action} on ${result.modifiedCount} users by ${req.user.email}`);

  return ApiResponse.success(res, `Bulk action completed. Affected ${result.modifiedCount} users.`, {
    action,
    modifiedCount: result.modifiedCount,
  });
});

// ============================================
// @desc    Send notification to users
// @route   POST /api/v1/admin/notifications/send
// @access  Private (Admin)
// ============================================
exports.sendBulkNotification = asyncHandler(async (req, res) => {
  const { targetUsers, subject, message, actionUrl, actionText } = req.body;

  const { sendNotificationEmail } = require('../utils/sendEmail');

  let filter = {};
  if (targetUsers === 'all') {
    filter = { isActive: true, isEmailVerified: true };
  } else if (targetUsers === 'mentors') {
    filter = { role: 'mentor', isActive: true };
  } else if (targetUsers === 'users') {
    filter = { role: 'user', isActive: true };
  } else if (Array.isArray(targetUsers)) {
    filter = { _id: { $in: targetUsers } };
  }

  const users = await User.find(filter).select('name email preferences');

  let successCount = 0;
  let failCount = 0;

  for (const user of users) {
    if (user.preferences?.notificationPreferences?.email !== false) {
      try {
        await sendNotificationEmail(user, {
          title: subject,
          message,
          actionUrl,
          actionText,
        });
        successCount++;
      } catch (err) {
        failCount++;
      }
    }
  }

  console.log(`📧 Bulk notification sent: ${successCount} success, ${failCount} failed`);

  return ApiResponse.success(res, `Notifications sent. Success: ${successCount}, Failed: ${failCount}`, {
    successCount,
    failCount,
    total: users.length,
  });
});

// ============================================
// @desc    Get recent activity logs
// @route   GET /api/v1/admin/activity-logs
// @access  Private (Admin)
// ============================================
exports.getActivityLogs = asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;

  // Get recent user registrations
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select('name email role createdAt lastLogin')
    .lean();

  // Get recent sessions
  const recentSessions = await MentorSession.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('mentee mentorUser', 'name email')
    .select('title status scheduledDate createdAt')
    .lean();

  // Get recent content
  const recentContent = await BusinessIdea.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('createdBy', 'name email')
    .select('title status createdAt')
    .lean();

  return ApiResponse.success(res, 'Activity logs fetched.', {
    recentUsers,
    recentSessions,
    recentContent,
  });
});