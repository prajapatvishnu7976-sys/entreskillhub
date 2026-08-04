// ============================================
// EntreSkillHub - Roadmap Controller
// Business roadmaps, steps, enrollment
// ============================================

const Roadmap = require('../models/Roadmap');
const BusinessIdea = require('../models/BusinessIdea');
const Progress = require('../models/Progress');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const { deleteFromCloudinary } = require('../config/cloudinary');

// ============================================
// @desc    Get all roadmaps with filters
// @route   GET /api/v1/roadmaps
// @access  Public
// ============================================
exports.getAllRoadmaps = asyncHandler(async (req, res) => {
  const {
    q = '',
    category,
    difficulty,
    isFeatured,
    isPremium,
    page = 1,
    limit = 12,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const filter = { isActive: true, status: 'approved' };

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } },
    ];
  }

  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
  if (isPremium !== undefined) filter.isPremium = isPremium === 'true';

  const sortField = {
    createdAt: 'createdAt',
    title: 'title',
    difficulty: 'difficulty',
    rating: 'rating.average',
    popular: 'stats.enrolledCount',
    duration: 'estimatedDuration.total',
  }[sortBy] || 'createdAt';

  const sortOptions = {};
  sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

  const [roadmaps, total] = await Promise.all([
    Roadmap.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('businessIdea', 'title category coverImage')
      .select('-steps -reviews -versionHistory'),
    Roadmap.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, 'Roadmaps fetched.', roadmaps, {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total,
    itemsPerPage: parseInt(limit),
    hasNext: skip + roadmaps.length < total,
    hasPrev: parseInt(page) > 1,
  });
});

// ============================================
// @desc    Get single roadmap by ID or slug
// @route   GET /api/v1/roadmaps/:identifier
// @access  Public
// ============================================
exports.getRoadmapById = asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
  const query = isObjectId ? { _id: identifier } : { slug: identifier };

  const roadmap = await Roadmap.findOne({ ...query, isActive: true })
    .populate('businessIdea', 'title category coverImage investment difficulty')
    .populate('relatedSkills', 'name category icon')
    .populate('recommendedMentors')
    .populate('createdBy', 'name profileImage')
    .populate('steps.resources', 'title resourceType thumbnail');

  if (!roadmap) {
    return ApiResponse.notFound(res, 'Roadmap not found.');
  }

  // Increment views
  roadmap.incrementViews().catch(console.error);

  // Check enrollment status if user is logged in
  let userProgress = null;
  let isEnrolled = false;

  if (req.user) {
    const progress = await Progress.findOne({
      user: req.user._id,
      roadmap: roadmap._id,
    });
    if (progress) {
      isEnrolled = true;
      userProgress = {
        status: progress.status,
        currentStep: progress.currentStep,
        completedSteps: progress.completedSteps,
        completionPercentage: progress.completionPercentage,
        totalTimeSpent: progress.totalTimeSpent,
      };
    }
  }

  return ApiResponse.success(res, 'Roadmap details fetched.', {
    roadmap,
    isEnrolled,
    userProgress,
  });
});

// ============================================
// @desc    Get roadmap by business idea
// @route   GET /api/v1/roadmaps/business/:businessId
// @access  Public
// ============================================
exports.getRoadmapByBusiness = asyncHandler(async (req, res) => {
  const { businessId } = req.params;

  const roadmaps = await Roadmap.getByBusinessIdea(businessId);

  return ApiResponse.success(res, 'Roadmaps fetched.', {
    roadmaps,
    total: roadmaps.length,
  });
});

// ============================================
// @desc    Get featured roadmaps
// @route   GET /api/v1/roadmaps/featured
// @access  Public
// ============================================
exports.getFeaturedRoadmaps = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const roadmaps = await Roadmap.getFeatured(parseInt(limit));

  return ApiResponse.success(res, 'Featured roadmaps fetched.', {
    roadmaps,
    total: roadmaps.length,
  });
});

// ============================================
// @desc    Get popular roadmaps
// @route   GET /api/v1/roadmaps/popular
// @access  Public
// ============================================
exports.getPopularRoadmaps = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const roadmaps = await Roadmap.getPopular(parseInt(limit));

  return ApiResponse.success(res, 'Popular roadmaps fetched.', {
    roadmaps,
    total: roadmaps.length,
  });
});

// ============================================
// @desc    Enroll in a roadmap
// @route   POST /api/v1/roadmaps/:id/enroll
// @access  Private
// ============================================
exports.enrollInRoadmap = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const roadmap = await Roadmap.findById(id);
  if (!roadmap) {
    return ApiResponse.notFound(res, 'Roadmap not found.');
  }

  // Check if already enrolled
  const existingProgress = await Progress.findOne({
    user: req.user._id,
    roadmap: id,
  });

  if (existingProgress) {
    return ApiResponse.conflict(res, 'You are already enrolled in this roadmap.', {
      progress: existingProgress,
    });
  }

  // Create progress record
  const progress = await Progress.create({
    user: req.user._id,
    businessIdea: roadmap.businessIdea,
    roadmap: roadmap._id,
    totalSteps: roadmap.totalSteps,
    status: 'enrolled',
    currentStep: 1,
  });

  // Update roadmap stats
  await roadmap.enrollUser();

  // Add to user's active roadmaps
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { activeRoadmaps: roadmap._id },
  });

  console.log(`✅ User enrolled in roadmap: ${req.user.email} → ${roadmap.title}`);

  return ApiResponse.created(res, 'Successfully enrolled in roadmap!', {
    progress,
    roadmap: {
      _id: roadmap._id,
      title: roadmap.title,
      totalSteps: roadmap.totalSteps,
    },
  });
});

// ============================================
// @desc    Get step details
// @route   GET /api/v1/roadmaps/:id/steps/:stepNumber
// @access  Private
// ============================================
exports.getRoadmapStep = asyncHandler(async (req, res) => {
  const { id, stepNumber } = req.params;

  const roadmap = await Roadmap.findById(id).populate('steps.resources');
  if (!roadmap) {
    return ApiResponse.notFound(res, 'Roadmap not found.');
  }

  const step = roadmap.getStep(parseInt(stepNumber));
  if (!step) {
    return ApiResponse.notFound(res, 'Step not found.');
  }

  // Get user progress for this step
  let stepProgress = null;
  if (req.user) {
    const progress = await Progress.findOne({
      user: req.user._id,
      roadmap: id,
    });

    if (progress) {
      stepProgress = progress.stepsProgress.find(
        (sp) => sp.stepNumber === parseInt(stepNumber)
      );
    }
  }

  const nextStep = roadmap.getNextStep(parseInt(stepNumber));
  const previousStep = roadmap.getPreviousStep(parseInt(stepNumber));

  return ApiResponse.success(res, 'Step details fetched.', {
    step,
    stepProgress,
    navigation: {
      hasNext: !!nextStep,
      hasPrevious: !!previousStep,
      nextStepNumber: nextStep?.stepNumber || null,
      previousStepNumber: previousStep?.stepNumber || null,
      totalSteps: roadmap.totalSteps,
    },
  });
});

// ============================================
// @desc    Update step progress
// @route   PUT /api/v1/roadmaps/:id/steps/:stepNumber/progress
// @access  Private
// ============================================
exports.updateStepProgress = asyncHandler(async (req, res) => {
  const { id, stepNumber } = req.params;
  const { status, userNotes, reflections, timeSpent } = req.body;

  const validStatuses = ['not_started', 'in_progress', 'completed', 'skipped', 'blocked'];
  if (!validStatuses.includes(status)) {
    return ApiResponse.badRequest(res, 'Invalid status.');
  }

  const progress = await Progress.findOne({
    user: req.user._id,
    roadmap: id,
  });

  if (!progress) {
    return ApiResponse.notFound(res, 'You are not enrolled in this roadmap.');
  }

  const additionalData = {};
  if (userNotes) additionalData.userNotes = userNotes;
  if (reflections) additionalData.reflections = reflections;
  if (timeSpent) additionalData.timeSpent = timeSpent;

  await progress.updateStepStatus(parseInt(stepNumber), status, additionalData);
  await progress.updateStreak();

  // If completed, update roadmap stats
  if (status === 'completed' && progress.completionPercentage === 100) {
    const roadmap = await Roadmap.findById(id);
    await roadmap.markCompletion();
  }

  return ApiResponse.success(res, 'Progress updated successfully.', {
    progress: {
      currentStep: progress.currentStep,
      completedSteps: progress.completedSteps,
      completionPercentage: progress.completionPercentage,
      status: progress.status,
      totalTimeSpent: progress.totalTimeSpent,
    },
  });
});

// ============================================
// @desc    Complete task in a step
// @route   POST /api/v1/roadmaps/:id/steps/:stepNumber/tasks/:taskId/complete
// @access  Private
// ============================================
exports.completeTask = asyncHandler(async (req, res) => {
  const { id, stepNumber, taskId } = req.params;
  const { timeSpent = 0 } = req.body;

  const progress = await Progress.findOne({
    user: req.user._id,
    roadmap: id,
  });

  if (!progress) {
    return ApiResponse.notFound(res, 'You are not enrolled in this roadmap.');
  }

  await progress.completeTask(parseInt(stepNumber), taskId, parseInt(timeSpent));

  return ApiResponse.success(res, 'Task marked as completed.', {
    completedSteps: progress.completedSteps,
    totalTimeSpent: progress.totalTimeSpent,
  });
});

// ============================================
// @desc    Get my roadmaps (enrolled)
// @route   GET /api/v1/roadmaps/my/roadmaps
// @access  Private
// ============================================
exports.getMyRoadmaps = asyncHandler(async (req, res) => {
  const { status = 'all' } = req.query;

  const filter = { user: req.user._id };
  if (status !== 'all') {
    filter.status = status;
  }

  const progressList = await Progress.find(filter)
    .populate('roadmap', 'title category coverImage totalSteps difficulty estimatedDuration')
    .populate('businessIdea', 'title category')
    .sort({ lastActivityAt: -1 });

  return ApiResponse.success(res, 'Your roadmaps fetched.', {
    roadmaps: progressList,
    total: progressList.length,
  });
});

// ============================================
// @desc    Rate roadmap
// @route   POST /api/v1/roadmaps/:id/rate
// @access  Private
// ============================================
exports.rateRoadmap = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return ApiResponse.badRequest(res, 'Rating must be between 1 and 5.');
  }

  const roadmap = await Roadmap.findById(id);
  if (!roadmap) {
    return ApiResponse.notFound(res, 'Roadmap not found.');
  }

  // Check if user completed the roadmap
  const progress = await Progress.findOne({
    user: req.user._id,
    roadmap: id,
    status: 'completed',
  });

  if (!progress) {
    return ApiResponse.forbidden(res, 'You can only rate roadmaps you have completed.');
  }

  await roadmap.addRating(req.user._id, rating, comment);

  return ApiResponse.success(res, 'Rating submitted!', {
    averageRating: roadmap.rating.average.toFixed(1),
    totalRatings: roadmap.rating.total,
  });
});

// ============================================
// @desc    Create roadmap (Admin/Mentor)
// @route   POST /api/v1/roadmaps
// @access  Private (Admin/Mentor)
// ============================================
exports.createRoadmap = asyncHandler(async (req, res) => {
  const roadmapData = {
    ...req.body,
    createdBy: req.user._id,
    status: req.user.role === 'admin' ? 'approved' : 'pending_review',
  };

  if (req.file) {
    roadmapData.coverImage = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  const roadmap = await Roadmap.create(roadmapData);

  console.log(`✅ Roadmap created: ${roadmap.title} by ${req.user.email}`);

  return ApiResponse.created(res, 'Roadmap created.', { roadmap });
});

// ============================================
// @desc    Update roadmap
// @route   PUT /api/v1/roadmaps/:id
// @access  Private (Admin/Owner)
// ============================================
exports.updateRoadmap = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const roadmap = await Roadmap.findById(id);
  if (!roadmap) {
    return ApiResponse.notFound(res, 'Roadmap not found.');
  }

  if (
    !['admin', 'superadmin'].includes(req.user.role) &&
    roadmap.createdBy.toString() !== req.user._id.toString()
  ) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  Object.assign(roadmap, req.body, { lastUpdatedBy: req.user._id });

  if (req.file) {
    if (roadmap.coverImage.publicId) {
      await deleteFromCloudinary(roadmap.coverImage.publicId).catch(console.error);
    }
    roadmap.coverImage = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  await roadmap.save();

  return ApiResponse.success(res, 'Roadmap updated.', { roadmap });
});

// ============================================
// @desc    Delete roadmap
// @route   DELETE /api/v1/roadmaps/:id
// @access  Private (Admin)
// ============================================
exports.deleteRoadmap = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const roadmap = await Roadmap.findById(id);
  if (!roadmap) {
    return ApiResponse.notFound(res, 'Roadmap not found.');
  }

  if (roadmap.coverImage.publicId) {
    await deleteFromCloudinary(roadmap.coverImage.publicId).catch(console.error);
  }

  roadmap.isActive = false;
  roadmap.status = 'archived';
  await roadmap.save();

  return ApiResponse.success(res, 'Roadmap archived.');
});