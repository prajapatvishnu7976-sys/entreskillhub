// ============================================
// EntreSkillHub - Progress Controller
// User journey tracking, milestones, achievements
// ============================================

const Progress = require('../models/Progress');
const Roadmap = require('../models/Roadmap');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendMilestoneEmail } = require('../utils/sendEmail');

// ============================================
// @desc    Get user's overall progress
// @route   GET /api/v1/progress/overview
// @access  Private
// ============================================
exports.getProgressOverview = asyncHandler(async (req, res) => {
  const [stats, activeProgress, completedProgress] = await Promise.all([
    Progress.getUserStats(req.user._id),
    Progress.getActiveProgress(req.user._id),
    Progress.getCompletedProgress(req.user._id),
  ]);

  const totalAchievements = activeProgress.reduce((sum, p) => sum + p.achievements.length, 0) +
                            completedProgress.reduce((sum, p) => sum + p.achievements.length, 0);

  return ApiResponse.success(res, 'Progress overview fetched.', {
    stats: {
      totalEnrolled: stats.totalEnrolled || 0,
      completed: stats.completed || 0,
      inProgress: stats.inProgress || 0,
      totalTimeSpent: stats.totalTimeSpent || 0,
      totalPoints: stats.totalPoints || 0,
      avgCompletion: Math.round(stats.avgCompletion || 0),
      totalAchievements,
    },
    activeProgress: activeProgress.slice(0, 5),
    completedProgress: completedProgress.slice(0, 5),
  });
});

// ============================================
// @desc    Get progress for specific roadmap
// @route   GET /api/v1/progress/roadmap/:roadmapId
// @access  Private
// ============================================
exports.getRoadmapProgress = asyncHandler(async (req, res) => {
  const { roadmapId } = req.params;

  const progress = await Progress.findOne({
    user: req.user._id,
    roadmap: roadmapId,
  })
    .populate('roadmap', 'title totalSteps difficulty coverImage')
    .populate('businessIdea', 'title category coverImage');

  if (!progress) {
    return ApiResponse.notFound(res, 'You are not enrolled in this roadmap.');
  }

  return ApiResponse.success(res, 'Roadmap progress fetched.', { progress });
});

// ============================================
// @desc    Get all my progress
// @route   GET /api/v1/progress/my
// @access  Private
// ============================================
exports.getAllMyProgress = asyncHandler(async (req, res) => {
  const { status = 'all', sortBy = 'lastActivityAt' } = req.query;

  const filter = { user: req.user._id };
  if (status !== 'all') filter.status = status;

  const sortOptions = {};
  sortOptions[sortBy] = -1;

  const progressList = await Progress.find(filter)
    .populate('roadmap', 'title category coverImage totalSteps difficulty estimatedDuration')
    .populate('businessIdea', 'title category')
    .sort(sortOptions);

  return ApiResponse.success(res, 'All progress fetched.', {
    progress: progressList,
    total: progressList.length,
  });
});

// ============================================
// @desc    Add reflection
// @route   POST /api/v1/progress/:progressId/reflection
// @access  Private
// ============================================
exports.addReflection = asyncHandler(async (req, res) => {
  const { progressId } = req.params;
  const { type, title, content, mood } = req.body;

  const progress = await Progress.findById(progressId);
  if (!progress) {
    return ApiResponse.notFound(res, 'Progress not found.');
  }

  if (progress.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  progress.reflections.push({ type, title, content, mood });
  await progress.save();

  return ApiResponse.created(res, 'Reflection added.', {
    totalReflections: progress.reflections.length,
  });
});

// ============================================
// @desc    Add challenge
// @route   POST /api/v1/progress/:progressId/challenge
// @access  Private
// ============================================
exports.addChallenge = asyncHandler(async (req, res) => {
  const { progressId } = req.params;
  const { description, atStep } = req.body;

  const progress = await Progress.findById(progressId);
  if (!progress) {
    return ApiResponse.notFound(res, 'Progress not found.');
  }

  if (progress.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  progress.challenges.push({ description, atStep });
  await progress.save();

  return ApiResponse.created(res, 'Challenge logged.', {
    totalChallenges: progress.challenges.length,
  });
});

// ============================================
// @desc    Resolve challenge
// @route   PUT /api/v1/progress/:progressId/challenge/:challengeId/resolve
// @access  Private
// ============================================
exports.resolveChallenge = asyncHandler(async (req, res) => {
  const { progressId, challengeId } = req.params;
  const { resolution } = req.body;

  const progress = await Progress.findById(progressId);
  if (!progress) {
    return ApiResponse.notFound(res, 'Progress not found.');
  }

  if (progress.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  const challenge = progress.challenges.id(challengeId);
  if (!challenge) {
    return ApiResponse.notFound(res, 'Challenge not found.');
  }

  challenge.isResolved = true;
  challenge.resolution = resolution;
  challenge.resolvedAt = Date.now();
  await progress.save();

  return ApiResponse.success(res, 'Challenge marked as resolved.');
});

// ============================================
// @desc    Add win/celebration
// @route   POST /api/v1/progress/:progressId/win
// @access  Private
// ============================================
exports.addWin = asyncHandler(async (req, res) => {
  const { progressId } = req.params;
  const { title, description, atStep } = req.body;

  const progress = await Progress.findById(progressId);
  if (!progress) {
    return ApiResponse.notFound(res, 'Progress not found.');
  }

  if (progress.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  progress.wins.push({ title, description, atStep });

  // Award experience points
  await progress.addExperience(5);

  return ApiResponse.created(res, 'Win celebrated! 🎉', {
    totalWins: progress.wins.length,
    experience: progress.experience,
    level: progress.level,
  });
});

// ============================================
// @desc    Add goal
// @route   POST /api/v1/progress/:progressId/goal
// @access  Private
// ============================================
exports.addGoal = asyncHandler(async (req, res) => {
  const { progressId } = req.params;
  const { title, description, targetDate, priority } = req.body;

  const progress = await Progress.findById(progressId);
  if (!progress) {
    return ApiResponse.notFound(res, 'Progress not found.');
  }

  if (progress.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  progress.goals.push({ title, description, targetDate, priority });
  await progress.save();

  return ApiResponse.created(res, 'Goal added.', {
    totalGoals: progress.goals.length,
  });
});

// ============================================
// @desc    Mark goal as achieved
// @route   PUT /api/v1/progress/:progressId/goal/:goalId/achieve
// @access  Private
// ============================================
exports.achieveGoal = asyncHandler(async (req, res) => {
  const { progressId, goalId } = req.params;

  const progress = await Progress.findById(progressId);
  if (!progress) {
    return ApiResponse.notFound(res, 'Progress not found.');
  }

  if (progress.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  const goal = progress.goals.id(goalId);
  if (!goal) {
    return ApiResponse.notFound(res, 'Goal not found.');
  }

  goal.isAchieved = true;
  goal.achievedAt = Date.now();
  await progress.save();

  // Award achievement
  await progress.awardAchievement({
    name: 'Goal Achieved',
    description: `Achieved goal: ${goal.title}`,
    category: 'milestone',
    icon: '🎯',
    points: 15,
  });

  return ApiResponse.success(res, 'Goal marked as achieved! 🎯', {
    goal,
    experience: progress.experience,
  });
});

// ============================================
// @desc    Track expense
// @route   POST /api/v1/progress/:progressId/expense
// @access  Private
// ============================================
exports.addExpense = asyncHandler(async (req, res) => {
  const { progressId } = req.params;
  const { category, description, amount, atStep } = req.body;

  if (!amount || amount <= 0) {
    return ApiResponse.badRequest(res, 'Valid amount is required.');
  }

  const progress = await Progress.findById(progressId);
  if (!progress) {
    return ApiResponse.notFound(res, 'Progress not found.');
  }

  if (progress.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  await progress.addExpense(category, description, amount, atStep);

  return ApiResponse.created(res, 'Expense recorded.', {
    totalInvestment: progress.financialData.actualInvestment,
    totalExpenses: progress.financialData.expenses.length,
  });
});

// ============================================
// @desc    Track revenue
// @route   POST /api/v1/progress/:progressId/revenue
// @access  Private
// ============================================
exports.addRevenue = asyncHandler(async (req, res) => {
  const { progressId } = req.params;
  const { source, amount } = req.body;

  if (!amount || amount <= 0) {
    return ApiResponse.badRequest(res, 'Valid amount is required.');
  }

  const progress = await Progress.findById(progressId);
  if (!progress) {
    return ApiResponse.notFound(res, 'Progress not found.');
  }

  if (progress.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  await progress.addRevenue(source, amount);

  // Award achievement for first revenue
  if (progress.financialData.revenue.length === 1) {
    await progress.awardAchievement({
      name: 'First Revenue!',
      description: 'You made your first revenue! 💰',
      category: 'milestone',
      icon: '💰',
      points: 50,
    });

    try {
      await sendMilestoneEmail(req.user, {
        title: 'First Revenue!',
        description: 'Congratulations on making your first sale!',
        icon: '💰',
      });
    } catch (err) {
      console.error('Milestone email failed:', err.message);
    }
  }

  const totalRevenue = progress.financialData.revenue.reduce((sum, r) => sum + r.amount, 0);

  return ApiResponse.created(res, 'Revenue recorded! 💰', {
    totalRevenue,
    roi: progress.roi,
  });
});

// ============================================
// @desc    Pause progress
// @route   PUT /api/v1/progress/:progressId/pause
// @access  Private
// ============================================
exports.pauseProgress = asyncHandler(async (req, res) => {
  const { progressId } = req.params;
  const { reason } = req.body;

  const progress = await Progress.findById(progressId);
  if (!progress) {
    return ApiResponse.notFound(res, 'Progress not found.');
  }

  if (progress.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  await progress.pauseProgress(reason);

  return ApiResponse.success(res, 'Progress paused.', { progress });
});

// ============================================
// @desc    Resume progress
// @route   PUT /api/v1/progress/:progressId/resume
// @access  Private
// ============================================
exports.resumeProgress = asyncHandler(async (req, res) => {
  const { progressId } = req.params;

  const progress = await Progress.findById(progressId);
  if (!progress) {
    return ApiResponse.notFound(res, 'Progress not found.');
  }

  if (progress.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  await progress.resumeProgress();

  return ApiResponse.success(res, 'Progress resumed. Welcome back!', { progress });
});

// ============================================
// @desc    Get achievements
// @route   GET /api/v1/progress/achievements
// @access  Private
// ============================================
exports.getAchievements = asyncHandler(async (req, res) => {
  const allProgress = await Progress.find({ user: req.user._id });

  const allAchievements = allProgress.flatMap((p) =>
    p.achievements.map((a) => ({
      ...a.toObject(),
      roadmap: p.roadmap,
    }))
  );

  // Sort by earned date
  allAchievements.sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt));

  const totalPoints = allAchievements.reduce((sum, a) => sum + (a.points || 0), 0);
  const totalExperience = allProgress.reduce((sum, p) => sum + p.experience, 0);
  const maxLevel = Math.max(...allProgress.map((p) => p.level), 1);

  return ApiResponse.success(res, 'Achievements fetched.', {
    achievements: allAchievements,
    totalAchievements: allAchievements.length,
    totalPoints,
    totalExperience,
    currentLevel: maxLevel,
    byCategory: {
      streak: allAchievements.filter((a) => a.category === 'streak').length,
      completion: allAchievements.filter((a) => a.category === 'completion').length,
      engagement: allAchievements.filter((a) => a.category === 'engagement').length,
      milestone: allAchievements.filter((a) => a.category === 'milestone').length,
      special: allAchievements.filter((a) => a.category === 'special').length,
    },
  });
});

// ============================================
// @desc    Get streak info
// @route   GET /api/v1/progress/streak
// @access  Private
// ============================================
exports.getStreakInfo = asyncHandler(async (req, res) => {
  const activeProgress = await Progress.find({
    user: req.user._id,
    status: { $in: ['in_progress', 'enrolled'] },
  });

  const currentStreak = Math.max(...activeProgress.map((p) => p.streakDays), 0);
  const longestStreak = Math.max(...activeProgress.map((p) => p.longestStreak), 0);

  return ApiResponse.success(res, 'Streak info fetched.', {
    currentStreak,
    longestStreak,
    isActive: currentStreak > 0,
  });
});

// ============================================
// @desc    Get financial summary
// @route   GET /api/v1/progress/financial-summary
// @access  Private
// ============================================
exports.getFinancialSummary = asyncHandler(async (req, res) => {
  const allProgress = await Progress.find({ user: req.user._id });

  const totalInvestment = allProgress.reduce(
    (sum, p) => sum + (p.financialData.actualInvestment || 0),
    0
  );

  const totalRevenue = allProgress.reduce((sum, p) => {
    return sum + (p.financialData.revenue?.reduce((s, r) => s + r.amount, 0) || 0);
  }, 0);

  const totalExpenses = allProgress.reduce((sum, p) => sum + p.financialData.expenses.length, 0);
  const totalRevenueEntries = allProgress.reduce((sum, p) => sum + (p.financialData.revenue?.length || 0), 0);

  const netProfit = totalRevenue - totalInvestment;
  const roi = totalInvestment > 0 ? Math.round(((totalRevenue - totalInvestment) / totalInvestment) * 100) : 0;

  return ApiResponse.success(res, 'Financial summary fetched.', {
    totalInvestment,
    totalRevenue,
    netProfit,
    roi,
    totalExpenses,
    totalRevenueEntries,
    projectsCount: allProgress.length,
  });
});

// ============================================
// @desc    Get activity calendar (for heatmap)
// @route   GET /api/v1/progress/activity-calendar
// @access  Private
// ============================================
exports.getActivityCalendar = asyncHandler(async (req, res) => {
  const { days = 90 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const allProgress = await Progress.find({ user: req.user._id });

  // Aggregate all activity by date
  const activityMap = {};

  allProgress.forEach((p) => {
    (p.activityCalendar || []).forEach((entry) => {
      const dateStr = entry.date.toISOString().split('T')[0];
      if (new Date(entry.date) >= startDate) {
        if (!activityMap[dateStr]) {
          activityMap[dateStr] = { date: dateStr, minutesSpent: 0, actionsPerformed: 0 };
        }
        activityMap[dateStr].minutesSpent += entry.minutesSpent || 0;
        activityMap[dateStr].actionsPerformed += entry.actionsPerformed || 0;
      }
    });
  });

  const calendar = Object.values(activityMap).sort((a, b) => new Date(a.date) - new Date(b.date));

  return ApiResponse.success(res, 'Activity calendar fetched.', {
    calendar,
    totalDays: calendar.length,
    dateRange: {
      start: startDate.toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
  });
});