// ============================================
// EntreSkillHub - Feedback Controller
// User feedback, bug reports, testimonials
// ============================================

const Feedback = require('../models/Feedback');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendNotificationEmail } = require('../utils/sendEmail');

// ============================================
// @desc    Submit feedback
// @route   POST /api/v1/feedback
// @access  Private/Public
// ============================================
exports.submitFeedback = asyncHandler(async (req, res) => {
  const {
    feedbackType, category, subCategory, subject, message,
    rating, priority, severity, relatedEntity, bugDetails,
    featureRequest, technicalInfo, source, submittedFrom, isAnonymous,
  } = req.body;

  const feedbackData = {
    feedbackType,
    category: category || 'other',
    subCategory,
    subject,
    message,
    rating,
    priority: priority || 'medium',
    severity,
    relatedEntity,
    bugDetails,
    featureRequest,
    technicalInfo: {
      ...technicalInfo,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer,
    },
    source: source || 'web',
    submittedFrom,
    isAnonymous: isAnonymous || false,
  };

  // Attach user if authenticated
  if (req.user) {
    feedbackData.user = req.user._id;
  } else {
    return ApiResponse.unauthorized(res, 'Please login to submit feedback.');
  }

  // Handle attachments if uploaded
  if (req.files && req.files.length > 0) {
    feedbackData.attachments = req.files.map((file) => ({
      type: file.mimetype.startsWith('image/') ? 'screenshot' : 'document',
      name: file.originalname,
      url: file.path,
      publicId: file.filename,
      size: file.size,
      mimeType: file.mimetype,
    }));
  }

  const feedback = await Feedback.create(feedbackData);

  console.log(`📝 Feedback submitted: ${feedback.subject} | Type: ${feedbackType} | User: ${req.user.email}`);

  return ApiResponse.created(
    res,
    'Feedback submitted successfully! Thank you for helping us improve.',
    {
      feedback: {
        _id: feedback._id,
        subject: feedback.subject,
        feedbackType: feedback.feedbackType,
        status: feedback.status,
        createdAt: feedback.createdAt,
      },
    }
  );
});

// ============================================
// @desc    Get my feedback submissions
// @route   GET /api/v1/feedback/my
// @access  Private
// ============================================
exports.getMyFeedback = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const [feedback, total] = await Promise.all([
    Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('assignedTo', 'name email')
      .select('-internalNotes -reports'),
    Feedback.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, 'Your feedback fetched.', feedback, {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total,
    itemsPerPage: parseInt(limit),
    hasNext: skip + feedback.length < total,
    hasPrev: parseInt(page) > 1,
  });
});

// ============================================
// @desc    Get feedback by ID
// @route   GET /api/v1/feedback/:id
// @access  Private
// ============================================
exports.getFeedbackById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const feedback = await Feedback.findById(id)
    .populate('user', 'name email profileImage')
    .populate('assignedTo', 'name email')
    .populate('resolvedBy', 'name email')
    .populate('responses.respondedBy', 'name email profileImage role');

  if (!feedback) {
    return ApiResponse.notFound(res, 'Feedback not found.');
  }

  // Check permission
  const isOwner = feedback.user?._id.toString() === req.user._id.toString();
  const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

  if (!isOwner && !isAdmin) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  // Filter internal notes for non-admin users
  if (!isAdmin) {
    feedback.internalNotes = undefined;
    feedback.responses = feedback.responses.filter((r) => !r.isInternal);
  }

  return ApiResponse.success(res, 'Feedback details fetched.', { feedback });
});

// ============================================
// @desc    Get public testimonials
// @route   GET /api/v1/feedback/testimonials
// @access  Public
// ============================================
exports.getTestimonials = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const testimonials = await Feedback.getTestimonials(parseInt(limit));

  return ApiResponse.success(res, 'Testimonials fetched.', {
    testimonials,
    total: testimonials.length,
  });
});

// ============================================
// @desc    Get public feature requests (with voting)
// @route   GET /api/v1/feedback/feature-requests
// @access  Public
// ============================================
exports.getFeatureRequests = asyncHandler(async (req, res) => {
  const { status, sortBy = 'votes', page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {
    feedbackType: 'feature_request',
    status: { $nin: ['closed', 'wont_fix'] },
  };
  if (status) filter.status = status;

  const sortField = {
    votes: 'upvotes',
    newest: 'createdAt',
    oldest: '-createdAt',
  }[sortBy] || 'upvotes';

  const [requests, total] = await Promise.all([
    Feedback.find(filter)
      .populate('user', 'name profileImage')
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('subject message featureRequest upvotes downvotes status createdAt'),
    Feedback.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, 'Feature requests fetched.', requests, {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total,
    itemsPerPage: parseInt(limit),
    hasNext: skip + requests.length < total,
    hasPrev: parseInt(page) > 1,
  });
});

// ============================================
// @desc    Vote on feedback (feature request)
// @route   POST /api/v1/feedback/:id/vote
// @access  Private
// ============================================
exports.voteOnFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { voteType } = req.body;

  if (!['up', 'down'].includes(voteType)) {
    return ApiResponse.badRequest(res, 'Vote type must be "up" or "down".');
  }

  const feedback = await Feedback.findById(id);
  if (!feedback) {
    return ApiResponse.notFound(res, 'Feedback not found.');
  }

  await feedback.vote(req.user._id, voteType);

  return ApiResponse.success(res, 'Vote recorded.', {
    upvotes: feedback.upvotes,
    downvotes: feedback.downvotes,
    voteScore: feedback.upvotes - feedback.downvotes,
  });
});

// ============================================
// @desc    Submit satisfaction rating
// @route   POST /api/v1/feedback/:id/satisfaction
// @access  Private
// ============================================
exports.submitSatisfaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isSatisfied, rating, comment } = req.body;

  const feedback = await Feedback.findById(id);
  if (!feedback) {
    return ApiResponse.notFound(res, 'Feedback not found.');
  }

  if (feedback.user?.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'You can only rate your own feedback.');
  }

  if (!['resolved', 'closed'].includes(feedback.status)) {
    return ApiResponse.badRequest(res, 'Feedback must be resolved before rating.');
  }

  await feedback.submitSatisfaction(isSatisfied, rating, comment);

  return ApiResponse.success(res, 'Thank you for your feedback!');
});

// ============================================
// @desc    Get all feedback (Admin)
// @route   GET /api/v1/feedback
// @access  Private (Admin)
// ============================================
exports.getAllFeedback = asyncHandler(async (req, res) => {
  const {
    status, feedbackType, priority, category, assignedTo,
    isOverdue, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc',
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const filter = {};

  if (status) filter.status = status;
  if (feedbackType) filter.feedbackType = feedbackType;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (assignedTo) filter.assignedTo = assignedTo;

  if (isOverdue === 'true') {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 72);
    filter.createdAt = { $lte: cutoff };
    filter.status = { $nin: ['resolved', 'closed'] };
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const [feedback, total] = await Promise.all([
    Feedback.find(filter)
      .populate('user', 'name email profileImage')
      .populate('assignedTo', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit)),
    Feedback.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, 'Feedback list fetched.', feedback, {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total,
    itemsPerPage: parseInt(limit),
    hasNext: skip + feedback.length < total,
    hasPrev: parseInt(page) > 1,
  });
});

// ============================================
// @desc    Get pending feedback (Admin)
// @route   GET /api/v1/feedback/pending
// @access  Private (Admin)
// ============================================
exports.getPendingFeedback = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  const pending = await Feedback.getPending(parseInt(limit));

  return ApiResponse.success(res, 'Pending feedback fetched.', {
    feedback: pending,
    total: pending.length,
  });
});

// ============================================
// @desc    Get overdue feedback (Admin)
// @route   GET /api/v1/feedback/overdue
// @access  Private (Admin)
// ============================================
exports.getOverdueFeedback = asyncHandler(async (req, res) => {
  const overdue = await Feedback.getOverdue();

  return ApiResponse.success(res, 'Overdue feedback fetched.', {
    feedback: overdue,
    total: overdue.length,
  });
});

// ============================================
// @desc    Assign feedback to user (Admin)
// @route   PUT /api/v1/feedback/:id/assign
// @access  Private (Admin)
// ============================================
exports.assignFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { assignTo } = req.body;

  const feedback = await Feedback.findById(id);
  if (!feedback) {
    return ApiResponse.notFound(res, 'Feedback not found.');
  }

  const assignee = await User.findById(assignTo);
  if (!assignee || !['admin', 'superadmin'].includes(assignee.role)) {
    return ApiResponse.badRequest(res, 'Invalid assignee. Must be an admin.');
  }

  await feedback.assignTo(assignTo);

  return ApiResponse.success(res, 'Feedback assigned successfully.', {
    feedback,
    assignedTo: assignee.name,
  });
});

// ============================================
// @desc    Add response to feedback (Admin)
// @route   POST /api/v1/feedback/:id/respond
// @access  Private (Admin)
// ============================================
exports.respondToFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message, isInternal = false } = req.body;

  if (!message || message.trim().length < 5) {
    return ApiResponse.badRequest(res, 'Response must be at least 5 characters.');
  }

  const feedback = await Feedback.findById(id).populate('user', 'name email');
  if (!feedback) {
    return ApiResponse.notFound(res, 'Feedback not found.');
  }

  await feedback.addResponse(req.user._id, message, isInternal);

  // Notify user if not internal
  if (!isInternal && feedback.user && feedback.notifications.emailUser) {
    try {
      await sendNotificationEmail(feedback.user, {
        title: `Response to your feedback: ${feedback.subject}`,
        message: `Our team has responded to your feedback. Please check the details.`,
        actionUrl: `${process.env.CLIENT_URL}/feedback/${feedback._id}`,
        actionText: 'View Response',
      });
    } catch (err) {
      console.error('Notification email failed:', err.message);
    }
  }

  return ApiResponse.created(res, 'Response added successfully.', {
    responseCount: feedback.responses.length,
  });
});

// ============================================
// @desc    Resolve feedback (Admin)
// @route   PUT /api/v1/feedback/:id/resolve
// @access  Private (Admin)
// ============================================
exports.resolveFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { resolution, resolutionType } = req.body;

  const feedback = await Feedback.findById(id).populate('user', 'name email');
  if (!feedback) {
    return ApiResponse.notFound(res, 'Feedback not found.');
  }

  await feedback.resolve(req.user._id, resolution, resolutionType);

  // Notify user
  if (feedback.user && feedback.notifications.emailUser) {
    try {
      await sendNotificationEmail(feedback.user, {
        title: `Your feedback has been resolved: ${feedback.subject}`,
        message: resolution,
        actionUrl: `${process.env.CLIENT_URL}/feedback/${feedback._id}`,
        actionText: 'View Resolution',
      });
    } catch (err) {
      console.error('Notification email failed:', err.message);
    }
  }

  console.log(`✅ Feedback resolved: ${feedback.subject} by ${req.user.email}`);

  return ApiResponse.success(res, 'Feedback resolved successfully.', { feedback });
});

// ============================================
// @desc    Update feedback status (Admin)
// @route   PUT /api/v1/feedback/:id/status
// @access  Private (Admin)
// ============================================
exports.updateFeedbackStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;

  const validStatuses = [
    'new', 'acknowledged', 'in_progress', 'pending_user',
    'resolved', 'closed', 'reopened', 'duplicate', 'wont_fix',
  ];

  if (!validStatuses.includes(status)) {
    return ApiResponse.badRequest(res, 'Invalid status.');
  }

  const feedback = await Feedback.findById(id);
  if (!feedback) {
    return ApiResponse.notFound(res, 'Feedback not found.');
  }

  feedback.status = status;
  if (note) {
    feedback.statusHistory.push({
      status,
      changedBy: req.user._id,
      note,
    });
  }

  await feedback.save();

  return ApiResponse.success(res, `Status updated to ${status}.`, { feedback });
});

// ============================================
// @desc    Add internal note (Admin)
// @route   POST /api/v1/feedback/:id/internal-note
// @access  Private (Admin)
// ============================================
exports.addInternalNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  if (!note || note.trim().length < 5) {
    return ApiResponse.badRequest(res, 'Note must be at least 5 characters.');
  }

  const feedback = await Feedback.findById(id);
  if (!feedback) {
    return ApiResponse.notFound(res, 'Feedback not found.');
  }

  await feedback.addInternalNote(req.user._id, note);

  return ApiResponse.created(res, 'Internal note added.');
});

// ============================================
// @desc    Mark as duplicate (Admin)
// @route   PUT /api/v1/feedback/:id/mark-duplicate
// @access  Private (Admin)
// ============================================
exports.markAsDuplicate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { originalFeedbackId } = req.body;

  const feedback = await Feedback.findById(id);
  if (!feedback) {
    return ApiResponse.notFound(res, 'Feedback not found.');
  }

  const original = await Feedback.findById(originalFeedbackId);
  if (!original) {
    return ApiResponse.notFound(res, 'Original feedback not found.');
  }

  await feedback.markAsDuplicate(originalFeedbackId);

  // Add to original's duplicates list
  original.duplicates.push(id);
  await original.save();

  return ApiResponse.success(res, 'Marked as duplicate.');
});

// ============================================
// @desc    Feature testimonial (Admin)
// @route   PUT /api/v1/feedback/:id/feature-testimonial
// @access  Private (Admin)
// ============================================
exports.featureTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isTestimonial, isPublic, displayOnHomepage, isFeatured } = req.body;

  const feedback = await Feedback.findById(id);
  if (!feedback) {
    return ApiResponse.notFound(res, 'Feedback not found.');
  }

  if (isTestimonial !== undefined) feedback.isTestimonial = isTestimonial;
  if (isPublic !== undefined) feedback.isPublic = isPublic;
  if (displayOnHomepage !== undefined) feedback.displayOnHomepage = displayOnHomepage;
  if (isFeatured !== undefined) feedback.isFeatured = isFeatured;

  await feedback.save();

  return ApiResponse.success(res, 'Testimonial settings updated.', { feedback });
});

// ============================================
// @desc    Get feedback statistics (Admin)
// @route   GET /api/v1/feedback/stats
// @access  Private (Admin)
// ============================================
exports.getFeedbackStats = asyncHandler(async (req, res) => {
  const [statusStats, typeStats, totalCount, avgSatisfaction] = await Promise.all([
    Feedback.getStats(),
    Feedback.aggregate([
      { $group: { _id: '$feedbackType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Feedback.countDocuments(),
    Feedback.aggregate([
      { $match: { 'satisfaction.rating': { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$satisfaction.rating' } } },
    ]),
  ]);

  return ApiResponse.success(res, 'Feedback statistics fetched.', {
    totalFeedback: totalCount,
    averageSatisfaction: avgSatisfaction[0]?.avg?.toFixed(1) || 0,
    byStatus: statusStats,
    byType: typeStats,
  });
});

// ============================================
// @desc    Delete feedback (Admin)
// @route   DELETE /api/v1/feedback/:id
// @access  Private (Admin)
// ============================================
exports.deleteFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const feedback = await Feedback.findById(id);
  if (!feedback) {
    return ApiResponse.notFound(res, 'Feedback not found.');
  }

  await feedback.deleteOne();

  return ApiResponse.success(res, 'Feedback deleted successfully.');
});