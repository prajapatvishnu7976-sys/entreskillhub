// ============================================
// EntreSkillHub - Business Idea Controller
// Business ideas CRUD, recommendations, matching
// ============================================

const BusinessIdea = require('../models/BusinessIdea');
const User = require('../models/User');
const Skill = require('../models/Skill');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  getRecommendations,
  getSimilarBusinesses,
  getTrendingForUser,
} = require('../utils/matchingEngine');
const { deleteFromCloudinary } = require('../config/cloudinary');

// ============================================
// @desc    Get all business ideas with filters
// @route   GET /api/v1/business-ideas
// @access  Public
// ============================================
exports.getAllBusinessIdeas = asyncHandler(async (req, res) => {
  const {
    q = '',
    category,
    difficulty,
    minInvestment,
    maxInvestment,
    isBeginnerFriendly,
    isLowInvestment,
    isFeatured,
    isTrending,
    page = 1,
    limit = 12,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const filter = { isActive: true, status: 'approved' };

  // Text search
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } },
    ];
  }

  // Category filter
  if (category) filter.category = category;

  // Difficulty filter
  if (difficulty) filter.difficulty = difficulty;

  // Investment range
  if (minInvestment !== undefined) {
    filter['investment.minimum'] = { $gte: parseFloat(minInvestment) };
  }
  if (maxInvestment !== undefined) {
    filter['investment.maximum'] = { $lte: parseFloat(maxInvestment) };
  }

  // Boolean flags
  if (isBeginnerFriendly !== undefined) filter.isBeginnerFriendly = isBeginnerFriendly === 'true';
  if (isLowInvestment !== undefined) filter.isLowInvestment = isLowInvestment === 'true';
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
  if (isTrending !== undefined) filter.isTrending = isTrending === 'true';

  // Sorting
  const sortField = {
    createdAt: 'createdAt',
    title: 'title',
    investment: 'investment.minimum',
    rating: 'rating.average',
    popularity: 'stats.viewCount',
    viewCount: 'stats.viewCount',
  }[sortBy] || 'createdAt';

  const sortOptions = {};
  sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

  const [businessIdeas, total] = await Promise.all([
    BusinessIdea.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('requiredSkills.skill', 'name category icon')
      .select('-successStories -matchingCriteria -seo'),
    BusinessIdea.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, 'Business ideas fetched.', businessIdeas, {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total,
    itemsPerPage: parseInt(limit),
    hasNext: skip + businessIdeas.length < total,
    hasPrev: parseInt(page) > 1,
  });
});

// ============================================
// @desc    Get single business idea by ID or slug
// @route   GET /api/v1/business-ideas/:identifier
// @access  Public
// ============================================
exports.getBusinessIdeaById = asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
  const query = isObjectId ? { _id: identifier } : { slug: identifier };

  const businessIdea = await BusinessIdea.findOne({ ...query, isActive: true })
    .populate('requiredSkills.skill', 'name category icon description')
    .populate('roadmap', 'title description totalSteps estimatedDuration')
    .populate('learningResources', 'title resourceType thumbnail duration rating')
    .populate('recommendedMentors')
    .populate('similarIdeas', 'title category coverImage rating')
    .populate('createdBy', 'name profileImage');

  if (!businessIdea) {
    return ApiResponse.notFound(res, 'Business idea not found.');
  }

  // Increment view count (async)
  businessIdea.incrementViews().catch(console.error);

  // Check if user has saved it
  let isSaved = false;
  let userMatchScore = null;

  if (req.user) {
    const user = await User.findById(req.user._id).populate('skills.skill');
    isSaved = user.savedBusinessIdeas.includes(businessIdea._id);
    userMatchScore = businessIdea.calculateMatchScore(user.skills, user.interests);
  }

  return ApiResponse.success(res, 'Business idea details fetched.', {
    businessIdea,
    isSaved,
    userMatchScore,
  });
});

// ============================================
// @desc    Get personalized recommendations
// @route   GET /api/v1/business-ideas/recommendations
// @access  Private
// ============================================
exports.getRecommendedBusinesses = asyncHandler(async (req, res) => {
  const { limit = 10, category, minScore = 30 } = req.query;

  const user = await User.findById(req.user._id).populate('skills.skill');

  const excludeIds = user.savedBusinessIdeas || [];

  const result = await getRecommendations(user, {
    limit: parseInt(limit),
    excludeIds,
    category,
    minScore: parseInt(minScore),
  });

  return ApiResponse.success(res, 'Personalized recommendations fetched.', {
    recommendations: result.recommendations,
    totalMatched: result.totalMatched,
    totalAnalyzed: result.totalAnalyzed,
    userProfile: {
      skills: user.skills.length,
      interests: user.interests.length,
      stage: user.entrepreneurshipStage,
    },
  });
});

// ============================================
// @desc    Get similar business ideas
// @route   GET /api/v1/business-ideas/:id/similar
// @access  Public
// ============================================
exports.getSimilarBusinessIdeas = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 5 } = req.query;

  const similar = await getSimilarBusinesses(id, parseInt(limit));

  return ApiResponse.success(res, 'Similar business ideas fetched.', {
    similar,
    total: similar.length,
  });
});

// ============================================
// @desc    Get trending business ideas
// @route   GET /api/v1/business-ideas/trending
// @access  Public
// ============================================
exports.getTrendingBusinesses = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  let trending;
  if (req.user) {
    const user = await User.findById(req.user._id);
    trending = await getTrendingForUser(user, parseInt(limit));
  } else {
    trending = await BusinessIdea.getTrending(parseInt(limit));
  }

  return ApiResponse.success(res, 'Trending business ideas fetched.', {
    trending,
    total: trending.length,
  });
});

// ============================================
// @desc    Get featured business ideas
// @route   GET /api/v1/business-ideas/featured
// @access  Public
// ============================================
exports.getFeaturedBusinesses = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const featured = await BusinessIdea.getFeatured(parseInt(limit));

  return ApiResponse.success(res, 'Featured business ideas fetched.', {
    featured,
    total: featured.length,
  });
});

// ============================================
// @desc    Get business ideas by category
// @route   GET /api/v1/business-ideas/category/:category
// @access  Public
// ============================================
exports.getBusinessIdeasByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { limit = 20, page = 1 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const decodedCategory = decodeURIComponent(category);

  const [ideas, total] = await Promise.all([
    BusinessIdea.find({
      category: decodedCategory,
      isActive: true,
      status: 'approved',
    })
      .sort({ 'stats.viewCount': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('requiredSkills.skill', 'name icon'),
    BusinessIdea.countDocuments({
      category: decodedCategory,
      isActive: true,
      status: 'approved',
    }),
  ]);

  return ApiResponse.paginated(res, `Business ideas in ${decodedCategory} fetched.`, ideas, {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total,
    itemsPerPage: parseInt(limit),
    hasNext: skip + ideas.length < total,
    hasPrev: parseInt(page) > 1,
  });
});

// ============================================
// @desc    Get business ideas by investment range
// @route   GET /api/v1/business-ideas/investment-range
// @access  Public
// ============================================
exports.getByInvestmentRange = asyncHandler(async (req, res) => {
  const { min = 0, max = 100000, limit = 20 } = req.query;

  const ideas = await BusinessIdea.getByInvestmentRange(
    parseFloat(min),
    parseFloat(max),
    parseInt(limit)
  );

  return ApiResponse.success(res, 'Business ideas fetched.', {
    ideas,
    total: ideas.length,
    range: { min: parseFloat(min), max: parseFloat(max) },
  });
});

// ============================================
// @desc    Get all categories with counts
// @route   GET /api/v1/business-ideas/categories
// @access  Public
// ============================================
exports.getBusinessCategories = asyncHandler(async (req, res) => {
  const categories = await BusinessIdea.aggregate([
    { $match: { isActive: true, status: 'approved' } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgInvestment: { $avg: '$investment.minimum' },
        avgRating: { $avg: '$rating.average' },
      },
    },
    { $sort: { count: -1 } },
    {
      $project: {
        _id: 0,
        category: '$_id',
        count: 1,
        avgInvestment: { $round: ['$avgInvestment', 0] },
        avgRating: { $round: ['$avgRating', 1] },
      },
    },
  ]);

  return ApiResponse.success(res, 'Business categories fetched.', {
    categories,
    total: categories.length,
  });
});

// ============================================
// @desc    Create business idea (Admin/Mentor)
// @route   POST /api/v1/business-ideas
// @access  Private (Admin/Mentor)
// ============================================
exports.createBusinessIdea = asyncHandler(async (req, res) => {
  const businessData = {
    ...req.body,
    createdBy: req.user._id,
    status: req.user.role === 'admin' ? 'approved' : 'pending_review',
  };

  // Handle cover image if uploaded
  if (req.files?.coverImage) {
    businessData.coverImage = {
      url: req.files.coverImage[0].path,
      publicId: req.files.coverImage[0].filename,
    };
  }

  // Handle gallery images
  if (req.files?.gallery) {
    businessData.gallery = req.files.gallery.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));
  }

  const businessIdea = await BusinessIdea.create(businessData);

  console.log(`✅ Business idea created: ${businessIdea.title} by ${req.user.email}`);

  return ApiResponse.created(res, 'Business idea created successfully.', { businessIdea });
});

// ============================================
// @desc    Update business idea
// @route   PUT /api/v1/business-ideas/:id
// @access  Private (Admin/Owner)
// ============================================
exports.updateBusinessIdea = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const businessIdea = await BusinessIdea.findById(id);
  if (!businessIdea) {
    return ApiResponse.notFound(res, 'Business idea not found.');
  }

  // Check ownership (unless admin)
  if (
    !['admin', 'superadmin'].includes(req.user.role) &&
    businessIdea.createdBy.toString() !== req.user._id.toString()
  ) {
    return ApiResponse.forbidden(res, 'You do not have permission to update this business idea.');
  }

  Object.assign(businessIdea, req.body, { lastUpdatedBy: req.user._id });

  // Handle new cover image
  if (req.files?.coverImage) {
    if (businessIdea.coverImage.publicId) {
      await deleteFromCloudinary(businessIdea.coverImage.publicId).catch(console.error);
    }
    businessIdea.coverImage = {
      url: req.files.coverImage[0].path,
      publicId: req.files.coverImage[0].filename,
    };
  }

  await businessIdea.save();

  return ApiResponse.success(res, 'Business idea updated.', { businessIdea });
});

// ============================================
// @desc    Delete business idea
// @route   DELETE /api/v1/business-ideas/:id
// @access  Private (Admin)
// ============================================
exports.deleteBusinessIdea = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const businessIdea = await BusinessIdea.findById(id);
  if (!businessIdea) {
    return ApiResponse.notFound(res, 'Business idea not found.');
  }

  // Delete images from Cloudinary
  if (businessIdea.coverImage.publicId) {
    await deleteFromCloudinary(businessIdea.coverImage.publicId).catch(console.error);
  }
  if (businessIdea.gallery && businessIdea.gallery.length > 0) {
    for (const img of businessIdea.gallery) {
      if (img.publicId) {
        await deleteFromCloudinary(img.publicId).catch(console.error);
      }
    }
  }

  // Soft delete
  businessIdea.isActive = false;
  businessIdea.status = 'archived';
  await businessIdea.save();

  return ApiResponse.success(res, 'Business idea archived.');
});

// ============================================
// @desc    Rate business idea
// @route   POST /api/v1/business-ideas/:id/rate
// @access  Private
// ============================================
exports.rateBusinessIdea = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const businessIdea = await BusinessIdea.findById(id);
  if (!businessIdea) {
    return ApiResponse.notFound(res, 'Business idea not found.');
  }

  await businessIdea.addRating(rating);

  return ApiResponse.success(res, 'Rating submitted.', {
    averageRating: businessIdea.rating.average.toFixed(1),
    totalRatings: businessIdea.rating.total,
  });
});

// ============================================
// @desc    Share business idea
// @route   POST /api/v1/business-ideas/:id/share
// @access  Public
// ============================================
exports.shareBusinessIdea = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const businessIdea = await BusinessIdea.findById(id);
  if (!businessIdea) {
    return ApiResponse.notFound(res, 'Business idea not found.');
  }

  businessIdea.stats.shareCount += 1;
  await businessIdea.save({ validateBeforeSave: false });

  return ApiResponse.success(res, 'Share count updated.', {
    shareUrl: `${process.env.CLIENT_URL}/business-ideas/${businessIdea.slug}`,
    shareCount: businessIdea.stats.shareCount,
  });
});

// ============================================
// @desc    Get pending business ideas (Admin)
// @route   GET /api/v1/business-ideas/pending
// @access  Private (Admin)
// ============================================
exports.getPendingBusinesses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [pending, total] = await Promise.all([
    BusinessIdea.find({ status: 'pending_review' })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    BusinessIdea.countDocuments({ status: 'pending_review' }),
  ]);

  return ApiResponse.paginated(res, 'Pending business ideas fetched.', pending, {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total,
    itemsPerPage: parseInt(limit),
    hasNext: skip + pending.length < total,
    hasPrev: parseInt(page) > 1,
  });
});

// ============================================
// @desc    Approve/Reject business idea (Admin)
// @route   PUT /api/v1/business-ideas/:id/review
// @access  Private (Admin)
// ============================================
exports.reviewBusinessIdea = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return ApiResponse.badRequest(res, 'Status must be approved or rejected.');
  }

  const businessIdea = await BusinessIdea.findById(id);
  if (!businessIdea) {
    return ApiResponse.notFound(res, 'Business idea not found.');
  }

  businessIdea.status = status;
  businessIdea.approvedBy = req.user._id;
  businessIdea.approvedAt = Date.now();

  await businessIdea.save();

  return ApiResponse.success(res, `Business idea ${status}.`, { businessIdea });
});