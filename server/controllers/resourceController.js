// ============================================
// EntreSkillHub - Learning Resource Controller
// Videos, articles, checklists, courses
// ============================================

const LearningResource = require('../models/LearningResource');
const Progress = require('../models/Progress');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const { deleteFromCloudinary } = require('../config/cloudinary');

// ============================================
// @desc    Get all learning resources
// @route   GET /api/v1/resources
// @access  Public
// ============================================
exports.getAllResources = asyncHandler(async (req, res) => {
  const {
    q = '',
    resourceType,
    category,
    difficulty,
    language,
    access,
    isFeatured,
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

  if (resourceType) filter.resourceType = resourceType;
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  if (language) filter.language = language;
  if (access) filter.access = access;
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

  const sortField = {
    createdAt: 'createdAt',
    title: 'title',
    popular: 'stats.viewCount',
    rating: 'rating.average',
    duration: 'duration.value',
  }[sortBy] || 'createdAt';

  const sortOptions = {};
  sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

  const [resources, total] = await Promise.all([
    LearningResource.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('uploadedBy', 'name profileImage role')
      .select('-content.body -reviews -comments -reports'),
    LearningResource.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, 'Resources fetched.', resources, {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total,
    itemsPerPage: parseInt(limit),
    hasNext: skip + resources.length < total,
    hasPrev: parseInt(page) > 1,
  });
});

// ============================================
// @desc    Get resource by ID or slug
// @route   GET /api/v1/resources/:identifier
// @access  Public
// ============================================
exports.getResourceById = asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
  const query = isObjectId ? { _id: identifier } : { slug: identifier };

  const resource = await LearningResource.findOne({ ...query, isActive: true })
    .populate('uploadedBy', 'name profileImage role')
    .populate('relatedSkills', 'name category icon')
    .populate('relatedBusinessIdeas', 'title category')
    .populate('relatedResources', 'title resourceType thumbnail')
    .populate('comments.user', 'name profileImage')
    .populate('reviews.user', 'name profileImage');

  if (!resource) {
    return ApiResponse.notFound(res, 'Resource not found.');
  }

  // Check access permission
  if (resource.access !== 'free' && !req.user) {
    return ApiResponse.unauthorized(res, 'Please login to access this resource.');
  }

  // Increment views (async)
  resource.incrementViews().catch(console.error);

  return ApiResponse.success(res, 'Resource fetched.', { resource });
});

// ============================================
// @desc    Get resources by type
// @route   GET /api/v1/resources/type/:type
// @access  Public
// ============================================
exports.getResourcesByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { limit = 20 } = req.query;

  const resources = await LearningResource.getByType(type, parseInt(limit));

  return ApiResponse.success(res, `${type} resources fetched.`, {
    resources,
    total: resources.length,
  });
});

// ============================================
// @desc    Get featured resources
// @route   GET /api/v1/resources/featured
// @access  Public
// ============================================
exports.getFeaturedResources = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const resources = await LearningResource.getFeatured(parseInt(limit));

  return ApiResponse.success(res, 'Featured resources fetched.', {
    resources,
    total: resources.length,
  });
});

// ============================================
// @desc    Get trending resources
// @route   GET /api/v1/resources/trending
// @access  Public
// ============================================
exports.getTrendingResources = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const resources = await LearningResource.getTrending(parseInt(limit));

  return ApiResponse.success(res, 'Trending resources fetched.', {
    resources,
    total: resources.length,
  });
});

// ============================================
// @desc    Get free resources
// @route   GET /api/v1/resources/free
// @access  Public
// ============================================
exports.getFreeResources = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  const resources = await LearningResource.getFreeResources(parseInt(limit));

  return ApiResponse.success(res, 'Free resources fetched.', {
    resources,
    total: resources.length,
  });
});

// ============================================
// @desc    Get resources by category
// @route   GET /api/v1/resources/category/:category
// @access  Public
// ============================================
exports.getResourcesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { limit = 20, page = 1 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [resources, total] = await Promise.all([
    LearningResource.find({
      category: decodeURIComponent(category),
      isActive: true,
      status: 'approved',
    })
      .sort({ 'stats.viewCount': -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    LearningResource.countDocuments({
      category: decodeURIComponent(category),
      isActive: true,
      status: 'approved',
    }),
  ]);

  return ApiResponse.paginated(res, 'Resources fetched.', resources, {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total,
    itemsPerPage: parseInt(limit),
    hasNext: skip + resources.length < total,
    hasPrev: parseInt(page) > 1,
  });
});

// ============================================
// @desc    Create new resource (Admin/Mentor)
// @route   POST /api/v1/resources
// @access  Private (Admin/Mentor)
// ============================================
exports.createResource = asyncHandler(async (req, res) => {
  const resourceData = {
    ...req.body,
    uploadedBy: req.user._id,
    uploaderRole: req.user.role,
    status: req.user.role === 'admin' ? 'approved' : 'pending_review',
  };

  if (req.file) {
    resourceData.thumbnail = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  const resource = await LearningResource.create(resourceData);

  console.log(`✅ Resource created: ${resource.title} by ${req.user.email}`);

  return ApiResponse.created(res, 'Resource created successfully.', { resource });
});

// ============================================
// @desc    Update resource
// @route   PUT /api/v1/resources/:id
// @access  Private (Admin/Owner)
// ============================================
exports.updateResource = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const resource = await LearningResource.findById(id);
  if (!resource) {
    return ApiResponse.notFound(res, 'Resource not found.');
  }

  if (
    !['admin', 'superadmin'].includes(req.user.role) &&
    resource.uploadedBy.toString() !== req.user._id.toString()
  ) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  Object.assign(resource, req.body, { lastUpdatedBy: req.user._id });

  if (req.file) {
    if (resource.thumbnail.publicId) {
      await deleteFromCloudinary(resource.thumbnail.publicId).catch(console.error);
    }
    resource.thumbnail = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  await resource.save();

  return ApiResponse.success(res, 'Resource updated.', { resource });
});

// ============================================
// @desc    Delete resource
// @route   DELETE /api/v1/resources/:id
// @access  Private (Admin/Owner)
// ============================================
exports.deleteResource = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const resource = await LearningResource.findById(id);
  if (!resource) {
    return ApiResponse.notFound(res, 'Resource not found.');
  }

  if (
    !['admin', 'superadmin'].includes(req.user.role) &&
    resource.uploadedBy.toString() !== req.user._id.toString()
  ) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  if (resource.thumbnail.publicId) {
    await deleteFromCloudinary(resource.thumbnail.publicId).catch(console.error);
  }

  resource.isActive = false;
  resource.status = 'archived';
  await resource.save();

  return ApiResponse.success(res, 'Resource archived.');
});

// ============================================
// @desc    Rate & review resource
// @route   POST /api/v1/resources/:id/review
// @access  Private
// ============================================
exports.reviewResource = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, title, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return ApiResponse.badRequest(res, 'Rating must be between 1 and 5.');
  }

  const resource = await LearningResource.findById(id);
  if (!resource) {
    return ApiResponse.notFound(res, 'Resource not found.');
  }

  await resource.addRating(req.user._id, rating, title, comment);

  return ApiResponse.success(res, 'Review submitted.', {
    averageRating: resource.rating.average.toFixed(1),
    totalReviews: resource.rating.total,
  });
});

// ============================================
// @desc    Add comment to resource
// @route   POST /api/v1/resources/:id/comment
// @access  Private
// ============================================
exports.addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, parentComment } = req.body;

  if (!content || content.trim().length < 1) {
    return ApiResponse.badRequest(res, 'Comment content is required.');
  }

  const resource = await LearningResource.findById(id);
  if (!resource) {
    return ApiResponse.notFound(res, 'Resource not found.');
  }

  await resource.addComment(req.user._id, content, parentComment);

  const updated = await LearningResource.findById(id).populate('comments.user', 'name profileImage');

  return ApiResponse.created(res, 'Comment added.', {
    comments: updated.comments.slice(-10),
  });
});

// ============================================
// @desc    Mark resource as completed
// @route   POST /api/v1/resources/:id/complete
// @access  Private
// ============================================
exports.markCompleted = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const resource = await LearningResource.findById(id);
  if (!resource) {
    return ApiResponse.notFound(res, 'Resource not found.');
  }

  await resource.markCompletion();

  return ApiResponse.success(res, 'Marked as completed!', {
    totalCompletions: resource.stats.completionCount,
  });
});

// ============================================
// @desc    Report resource
// @route   POST /api/v1/resources/:id/report
// @access  Private
// ============================================
exports.reportResource = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason, description } = req.body;

  if (!reason) {
    return ApiResponse.badRequest(res, 'Reason is required.');
  }

  const resource = await LearningResource.findById(id);
  if (!resource) {
    return ApiResponse.notFound(res, 'Resource not found.');
  }

  await resource.reportContent(req.user._id, reason, description);

  return ApiResponse.success(res, 'Report submitted. Our team will review it.');
});

// ============================================
// @desc    Get pending resources (Admin)
// @route   GET /api/v1/resources/pending
// @access  Private (Admin)
// ============================================
exports.getPendingResources = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [pending, total] = await Promise.all([
    LearningResource.find({ status: 'pending_review' })
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    LearningResource.countDocuments({ status: 'pending_review' }),
  ]);

  return ApiResponse.paginated(res, 'Pending resources fetched.', pending, {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total,
    itemsPerPage: parseInt(limit),
    hasNext: skip + pending.length < total,
    hasPrev: parseInt(page) > 1,
  });
});

// ============================================
// @desc    Approve/Reject resource (Admin)
// @route   PUT /api/v1/resources/:id/review
// @access  Private (Admin)
// ============================================
exports.reviewResourceStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return ApiResponse.badRequest(res, 'Status must be approved or rejected.');
  }

  const resource = await LearningResource.findById(id);
  if (!resource) {
    return ApiResponse.notFound(res, 'Resource not found.');
  }

  resource.status = status;
  resource.approvedBy = req.user._id;
  resource.approvedAt = Date.now();
  if (status === 'rejected') {
    resource.rejectionReason = rejectionReason;
  }

  await resource.save();

  return ApiResponse.success(res, `Resource ${status}.`, { resource });
});