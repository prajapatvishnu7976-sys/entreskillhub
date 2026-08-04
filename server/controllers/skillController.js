// ============================================
// EntreSkillHub - Skill Controller
// Skills management, categories, recommendations
// ============================================

const Skill = require('../models/Skill');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');

// ============================================
// @desc    Get all skills with filters
// @route   GET /api/v1/skills
// @access  Public
// ============================================
exports.getAllSkills = asyncHandler(async (req, res) => {
  const {
    q = '',
    category,
    subCategory,
    difficulty,
    isFeatured,
    isTrending,
    page = 1,
    limit = 20,
    sortBy = 'popularity',
    sortOrder = 'desc',
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const filter = { isActive: true, status: 'approved' };

  if (category) filter.category = category;
  if (subCategory) filter.subCategory = subCategory;
  if (difficulty) filter.difficultyLevel = difficulty;
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
  if (isTrending !== undefined) filter.isTrending = isTrending === 'true';

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } },
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const [skills, total] = await Promise.all([
    Skill.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-translations -seo -createdBy'),
    Skill.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, 'Skills fetched successfully.', skills, {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total,
    itemsPerPage: parseInt(limit),
    hasNext: skip + skills.length < total,
    hasPrev: parseInt(page) > 1,
  });
});

// ============================================
// @desc    Get skill by ID or slug
// @route   GET /api/v1/skills/:identifier
// @access  Public
// ============================================
exports.getSkillById = asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
  const query = isObjectId ? { _id: identifier } : { slug: identifier };

  const skill = await Skill.findOne({ ...query, isActive: true })
    .populate('relatedBusinessIdeas', 'title category coverImage difficulty')
    .populate('relatedSkills', 'name category icon')
    .populate('learningResources', 'title resourceType thumbnail duration')
    .populate('createdBy', 'name profileImage');

  if (!skill) {
    return ApiResponse.notFound(res, 'Skill not found.');
  }

  // Increment view count (async, don't wait)
  skill.incrementViews().catch(console.error);

  return ApiResponse.success(res, 'Skill details fetched.', { skill });
});

// ============================================
// @desc    Get skills by category
// @route   GET /api/v1/skills/category/:category
// @access  Public
// ============================================
exports.getSkillsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { limit = 20 } = req.query;

  const skills = await Skill.getByCategory(decodeURIComponent(category), parseInt(limit));

  return ApiResponse.success(res, `Skills in ${category} fetched.`, {
    category,
    skills,
    total: skills.length,
  });
});

// ============================================
// @desc    Get featured skills
// @route   GET /api/v1/skills/featured
// @access  Public
// ============================================
exports.getFeaturedSkills = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const skills = await Skill.getFeaturedSkills(parseInt(limit));

  return ApiResponse.success(res, 'Featured skills fetched.', {
    skills,
    total: skills.length,
  });
});

// ============================================
// @desc    Get trending skills
// @route   GET /api/v1/skills/trending
// @access  Public
// ============================================
exports.getTrendingSkills = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const skills = await Skill.getTrendingSkills(parseInt(limit));

  return ApiResponse.success(res, 'Trending skills fetched.', {
    skills,
    total: skills.length,
  });
});

// ============================================
// @desc    Get all skill categories with count
// @route   GET /api/v1/skills/categories
// @access  Public
// ============================================
exports.getSkillCategories = asyncHandler(async (req, res) => {
  const categories = await Skill.aggregate([
    { $match: { isActive: true, status: 'approved' } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        featuredCount: {
          $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] },
        },
        avgPopularity: { $avg: '$popularity' },
      },
    },
    { $sort: { count: -1 } },
    {
      $project: {
        _id: 0,
        category: '$_id',
        count: 1,
        featuredCount: 1,
        avgPopularity: { $round: ['$avgPopularity', 1] },
      },
    },
  ]);

  return ApiResponse.success(res, 'Categories fetched.', {
    categories,
    total: categories.length,
  });
});

// ============================================
// @desc    Get skill statistics
// @route   GET /api/v1/skills/stats
// @access  Public
// ============================================
exports.getSkillStats = asyncHandler(async (req, res) => {
  const [stats, totalCount, featuredCount, trendingCount] = await Promise.all([
    Skill.getSkillStats(),
    Skill.countDocuments({ isActive: true, status: 'approved' }),
    Skill.countDocuments({ isFeatured: true, isActive: true }),
    Skill.countDocuments({ isTrending: true, isActive: true }),
  ]);

  return ApiResponse.success(res, 'Skill statistics fetched.', {
    totalSkills: totalCount,
    featuredSkills: featuredCount,
    trendingSkills: trendingCount,
    byCategory: stats,
  });
});

// ============================================
// @desc    Create new skill (Admin)
// @route   POST /api/v1/skills
// @access  Private (Admin)
// ============================================
exports.createSkill = asyncHandler(async (req, res) => {
  const skillData = {
    ...req.body,
    createdBy: req.user._id,
  };

  const skill = await Skill.create(skillData);

  console.log(`✅ Skill created: ${skill.name} by ${req.user.email}`);

  return ApiResponse.created(res, 'Skill created successfully.', { skill });
});

// ============================================
// @desc    Update skill (Admin)
// @route   PUT /api/v1/skills/:id
// @access  Private (Admin)
// ============================================
exports.updateSkill = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const skill = await Skill.findByIdAndUpdate(
    id,
    { ...req.body, lastUpdatedBy: req.user._id },
    { new: true, runValidators: true }
  );

  if (!skill) {
    return ApiResponse.notFound(res, 'Skill not found.');
  }

  return ApiResponse.success(res, 'Skill updated successfully.', { skill });
});

// ============================================
// @desc    Delete skill (Admin)
// @route   DELETE /api/v1/skills/:id
// @access  Private (Admin)
// ============================================
exports.deleteSkill = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const skill = await Skill.findById(id);
  if (!skill) {
    return ApiResponse.notFound(res, 'Skill not found.');
  }

  // Soft delete
  skill.isActive = false;
  skill.status = 'archived';
  await skill.save();

  return ApiResponse.success(res, 'Skill archived successfully.');
});

// ============================================
// @desc    Rate a skill
// @route   POST /api/v1/skills/:id/rate
// @access  Private
// ============================================
exports.rateSkill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return ApiResponse.badRequest(res, 'Rating must be between 1 and 5.');
  }

  const skill = await Skill.findById(id);
  if (!skill) {
    return ApiResponse.notFound(res, 'Skill not found.');
  }

  await skill.updateRating(rating);

  return ApiResponse.success(res, 'Rating submitted successfully.', {
    averageRating: skill.averageRating,
    totalRatings: skill.totalRatings,
  });
});

// ============================================
// @desc    Get skill recommendations for user
// @route   GET /api/v1/skills/recommendations
// @access  Private
// ============================================
exports.getSkillRecommendations = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('skills.skill');

  const userSkillIds = user.skills.map((s) => s.skill._id.toString());
  const userInterests = user.interests || [];

  // Find related skills
  const relatedSkills = await Skill.find({
    _id: { $nin: userSkillIds },
    isActive: true,
    status: 'approved',
    $or: [
      { category: { $in: user.skills.map((s) => s.skill.category) } },
      { tags: { $in: userInterests.map((i) => i.toLowerCase()) } },
    ],
  })
    .sort({ popularity: -1, averageRating: -1 })
    .limit(10);

  return ApiResponse.success(res, 'Skill recommendations fetched.', {
    recommendations: relatedSkills,
    basedOn: {
      userSkills: user.skills.length,
      userInterests: userInterests.length,
    },
  });
});