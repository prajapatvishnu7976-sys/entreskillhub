// ============================================
// EntreSkillHub - Dashboard Controller
// Personalized dashboards for users, mentors, admins
// ============================================

const User = require('../models/User');
const Mentor = require('../models/Mentor');
const BusinessIdea = require('../models/BusinessIdea');
const Roadmap = require('../models/Roadmap');
const LearningResource = require('../models/LearningResource');
const MentorSession = require('../models/MentorSession');
const Progress = require('../models/Progress');
const Bookmark = require('../models/Bookmark');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const { getRecommendations } = require('../utils/matchingEngine');

// ============================================
// @desc    Get user dashboard
// @route   GET /api/v1/dashboard/user
// @access  Private
// ============================================
exports.getUserDashboard = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('skills.skill');

  // Get all data in parallel
  const [
    progressStats, activeProgress, upcomingSessions,
    recentBookmarks, recommendedBusinesses, trendingResources,
    achievements, streakInfo,
  ] = await Promise.all([
    Progress.getUserStats(req.user._id),
    Progress.getActiveProgress(req.user._id),
    MentorSession.getUpcomingForUser(req.user._id, false),
    Bookmark.find({ user: req.user._id, isArchived: false })
      .sort({ createdAt: -1 })
      .limit(5),
    getRecommendations(user, { limit: 6, minScore: 40 }),
    LearningResource.getTrending(6),
    Progress.find({ user: req.user._id })
      .select('achievements')
      .sort({ createdAt: -1 })
      .limit(5),
    Progress.find({ user: req.user._id }).select('streakDays longestStreak'),
  ]);

  // Calculate streak
  const currentStreak = Math.max(...streakInfo.map((p) => p.streakDays), 0);
  const longestStreak = Math.max(...streakInfo.map((p) => p.longestStreak), 0);

  // Aggregate achievements
  const allAchievements = achievements
    .flatMap((p) => p.achievements)
    .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
    .slice(0, 5);

  // Profile completeness
  const profileTasks = [
    { task: 'Add profile picture', completed: !!user.profileImage.publicId },
    { task: 'Complete bio', completed: !!user.bio && user.bio.length > 20 },
    { task: 'Add skills', completed: user.skills.length > 0 },
    { task: 'Add interests', completed: user.interests.length > 0 },
    { task: 'Add location', completed: !!user.location.city },
    { task: 'Verify email', completed: user.isEmailVerified },
    { task: 'Add phone', completed: !!user.phone },
    { task: 'Add social links', completed: !!(user.socialLinks.linkedin || user.socialLinks.website) },
  ];

  const completedTasks = profileTasks.filter((t) => t.completed).length;
  const profileCompletion = Math.round((completedTasks / profileTasks.length) * 100);

  return ApiResponse.success(res, 'User dashboard fetched.', {
    user: {
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
      entrepreneurshipStage: user.entrepreneurshipStage,
      memberSince: user.createdAt,
      profileCompletion,
    },
    quickStats: {
      totalEnrolled: progressStats.totalEnrolled || 0,
      completed: progressStats.completed || 0,
      inProgress: progressStats.inProgress || 0,
      totalPoints: progressStats.totalPoints || 0,
      totalSkills: user.skills.length,
      savedBusinesses: user.savedBusinessIdeas.length,
      upcomingSessions: upcomingSessions.length,
    },
    streak: {
      current: currentStreak,
      longest: longestStreak,
      isActive: currentStreak > 0,
    },
    activeProgress: activeProgress.slice(0, 3),
    upcomingSessions: upcomingSessions.slice(0, 3),
    recentBookmarks,
    recommendedBusinesses: recommendedBusinesses.recommendations.slice(0, 6),
    trendingResources,
    recentAchievements: allAchievements,
    profileTasks,
  });
});

// ============================================
// @desc    Get mentor dashboard
// @route   GET /api/v1/dashboard/mentor
// @access  Private (Mentor)
// ============================================
exports.getMentorDashboard = asyncHandler(async (req, res) => {
  const mentor = await Mentor.findOne({ user: req.user._id })
    .populate('user', 'name email profileImage');

  if (!mentor) {
    return ApiResponse.notFound(res, 'Mentor profile not found.');
  }

  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    upcomingSessions, todaySessions, thisWeekSessions,
    recentReviews, monthEarnings, weekEarnings,
    pendingQuestions, uploadedResources, activeMentees,
  ] = await Promise.all([
    MentorSession.find({
      mentor: mentor._id,
      status: { $in: ['pending', 'confirmed'] },
      scheduledDate: { $gte: new Date() },
    })
      .sort({ scheduledDate: 1 })
      .limit(5)
      .populate('mentee', 'name email profileImage'),

    MentorSession.find({
      mentor: mentor._id,
      scheduledDate: {
        $gte: todayStart,
        $lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
      },
    })
      .populate('mentee', 'name profileImage'),

    MentorSession.countDocuments({
      mentor: mentor._id,
      scheduledDate: { $gte: thisWeekStart },
    }),

    MentorSession.find({
      mentor: mentor._id,
      'menteeReview.rating': { $exists: true },
    })
      .sort({ 'menteeReview.submittedAt': -1 })
      .limit(5)
      .populate('mentee', 'name profileImage')
      .select('menteeReview mentee'),

    MentorSession.aggregate([
      {
        $match: {
          mentor: mentor._id,
          status: 'completed',
          createdAt: { $gte: thisMonthStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$pricing.mentorEarnings' } } },
    ]),

    MentorSession.aggregate([
      {
        $match: {
          mentor: mentor._id,
          status: 'completed',
          createdAt: { $gte: thisWeekStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$pricing.mentorEarnings' } } },
    ]),

    Mentor.findById(mentor._id).select('qAndA').then((m) =>
      m.qAndA.filter((q) => !q.answer).length
    ),

    LearningResource.countDocuments({ uploadedBy: req.user._id }),

    MentorSession.aggregate([
      { $match: { mentor: mentor._id, status: { $in: ['confirmed', 'in_progress'] } } },
      { $group: { _id: '$mentee' } },
      { $count: 'total' },
    ]),
  ]);

  return ApiResponse.success(res, 'Mentor dashboard fetched.', {
    mentor: {
      _id: mentor._id,
      user: mentor.user,
      title: mentor.title,
      mentorLevel: mentor.mentorLevel,
      verification: mentor.verification.status,
      isTopMentor: mentor.isTopMentor,
      profileCompletion: mentor.stats.profileCompletion,
    },
    quickStats: {
      totalSessions: mentor.stats.totalSessions,
      completedSessions: mentor.stats.completedSessions,
      totalMentees: mentor.stats.totalMentees,
      activeMentees: activeMentees[0]?.total || 0,
      totalHours: Math.round(mentor.stats.totalHours),
      totalEarnings: mentor.stats.totalEarnings,
      monthEarnings: monthEarnings[0]?.total || 0,
      weekEarnings: weekEarnings[0]?.total || 0,
      thisWeekSessions,
      todaySessionCount: todaySessions.length,
      pendingQuestions,
      uploadedResources,
    },
    rating: {
      average: mentor.rating.average.toFixed(1),
      total: mentor.rating.total,
      distribution: mentor.rating.distribution,
    },
    todaySessions,
    upcomingSessions,
    recentReviews,
    profileViews: mentor.stats.profileViews,
    responseRate: mentor.stats.responseRate,
  });
});

// ============================================
// @desc    Get admin dashboard
// @route   GET /api/v1/dashboard/admin
// @access  Private (Admin)
// ============================================
exports.getAdminDashboardData = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers, totalMentors, newUsersToday, newUsersYesterday,
    activeUsersToday, totalSessions, sessionsToday, sessionsThisMonth,
    totalRevenue, revenueThisMonth, pendingApprovals, recentUsers,
    recentSessions, topCategories,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Mentor.countDocuments({ 'verification.status': 'verified', isActive: true }),
    User.countDocuments({ createdAt: { $gte: todayStart } }),
    User.countDocuments({
      createdAt: { $gte: yesterdayStart, $lt: todayStart },
    }),
    User.countDocuments({ lastActive: { $gte: todayStart } }),
    MentorSession.countDocuments(),
    MentorSession.countDocuments({ createdAt: { $gte: todayStart } }),
    MentorSession.countDocuments({ createdAt: { $gte: thisMonthStart } }),

    MentorSession.aggregate([
      { $match: { 'payment.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.platformFee' } } },
    ]),

    MentorSession.aggregate([
      {
        $match: {
          'payment.status': 'completed',
          createdAt: { $gte: thisMonthStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$pricing.platformFee' } } },
    ]),

    Promise.all([
      Mentor.countDocuments({ 'verification.status': 'pending' }),
      BusinessIdea.countDocuments({ status: 'pending_review' }),
      LearningResource.countDocuments({ status: 'pending_review' }),
    ]).then(([mentors, ideas, resources]) => ({
      mentors, ideas, resources, total: mentors + ideas + resources,
    })),

    User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email role createdAt isEmailVerified'),

    MentorSession.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('mentee mentorUser', 'name email')
      .select('title status scheduledDate pricing'),

    BusinessIdea.aggregate([
      { $match: { isActive: true, status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const userGrowth = newUsersYesterday > 0
    ? Math.round(((newUsersToday - newUsersYesterday) / newUsersYesterday) * 100)
    : 100;

  return ApiResponse.success(res, 'Admin dashboard fetched.', {
    overview: {
      totalUsers,
      totalMentors,
      totalSessions,
      totalRevenue: totalRevenue[0]?.total || 0,
    },
    today: {
      newUsers: newUsersToday,
      activeUsers: activeUsersToday,
      newSessions: sessionsToday,
      userGrowth,
    },
    thisMonth: {
      sessions: sessionsThisMonth,
      revenue: revenueThisMonth[0]?.total || 0,
    },
    pendingApprovals,
    recentUsers,
    recentSessions,
    topCategories,
    quickActions: [
      { label: 'Review Mentors', count: pendingApprovals.mentors, url: '/admin/mentors/pending' },
      { label: 'Review Business Ideas', count: pendingApprovals.ideas, url: '/admin/business-ideas/pending' },
      { label: 'Review Resources', count: pendingApprovals.resources, url: '/admin/resources/pending' },
    ],
  });
});

// ============================================
// @desc    Get quick stats (for header/sidebar)
// @route   GET /api/v1/dashboard/quick-stats
// @access  Private
// ============================================
exports.getQuickStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [unreadNotifications, activeProgressCount, upcomingSessionsCount, dueReminders] = await Promise.all([
    Promise.resolve(0), // Placeholder for notifications
    Progress.countDocuments({
      user: userId,
      status: { $in: ['enrolled', 'in_progress'] },
    }),
    MentorSession.countDocuments({
      $or: [{ mentee: userId }, { mentorUser: userId }],
      status: { $in: ['pending', 'confirmed'] },
      scheduledDate: { $gte: new Date() },
    }),
    Bookmark.countDocuments({
      user: userId,
      'reminder.isSet': true,
      'reminder.isCompleted': false,
      'reminder.remindAt': { $lte: new Date() },
    }),
  ]);

  return ApiResponse.success(res, 'Quick stats fetched.', {
    unreadNotifications,
    activeProgress: activeProgressCount,
    upcomingSessions: upcomingSessionsCount,
    dueReminders,
  });
});

// ============================================
// @desc    Get platform-wide statistics (public)
// @route   GET /api/v1/dashboard/platform-stats
// @access  Public
// ============================================
exports.getPublicStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalMentors, totalBusinessIdeas, totalResources, totalSessions] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Mentor.countDocuments({ 'verification.status': 'verified', isActive: true }),
    BusinessIdea.countDocuments({ isActive: true, status: 'approved' }),
    LearningResource.countDocuments({ isActive: true, status: 'approved' }),
    MentorSession.countDocuments({ status: 'completed' }),
  ]);

  return ApiResponse.success(res, 'Platform statistics fetched.', {
    totalUsers,
    totalMentors,
    totalBusinessIdeas,
    totalResources,
    totalCompletedSessions: totalSessions,
    lastUpdated: new Date(),
  });
});

// ============================================
// @desc    Get personalized recommendations widget
// @route   GET /api/v1/dashboard/recommendations
// @access  Private
// ============================================
exports.getDashboardRecommendations = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('skills.skill');

  const [businessRecs, trendingResources, topMentors] = await Promise.all([
    getRecommendations(user, { limit: 6, minScore: 40 }),
    LearningResource.getTrending(6),
    Mentor.getTopMentors(6),
  ]);

  return ApiResponse.success(res, 'Recommendations fetched.', {
    businessIdeas: businessRecs.recommendations,
    resources: trendingResources,
    mentors: topMentors,
  });
});