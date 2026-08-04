// ============================================
// EntreSkillHub - Bookmark Controller
// User saved items management
// ============================================

const Bookmark = require('../models/Bookmark');
const BusinessIdea = require('../models/BusinessIdea');
const Roadmap = require('../models/Roadmap');
const LearningResource = require('../models/LearningResource');
const Mentor = require('../models/Mentor');
const Skill = require('../models/Skill');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');

// ============================================
// Helper: Get model name from item type
// ============================================
const getModelForType = (itemType) => {
  const map = {
    business_idea: 'BusinessIdea',
    roadmap: 'Roadmap',
    learning_resource: 'LearningResource',
    mentor: 'Mentor',
    skill: 'Skill',
    session: 'MentorSession',
    user: 'User',
    article: 'LearningResource',
    video: 'LearningResource',
    checklist: 'LearningResource',
  };
  return map[itemType];
};

// ============================================
// Helper: Get item snapshot
// ============================================
const getItemSnapshot = async (itemType, itemId) => {
  const modelName = getModelForType(itemType);
  if (!modelName) return null;

  const Model = require(`../models/${modelName}`);
  const item = await Model.findById(itemId).lean();

  if (!item) return null;

  const snapshot = {
    title: item.title || item.name || 'Untitled',
    description: item.description || '',
    shortDescription: item.shortDescription || '',
    imageUrl: item.coverImage?.url || item.thumbnail?.url || item.image?.url || item.profileImage?.url || '',
    url: `/${itemType}s/${item.slug || item._id}`,
    category: item.category || '',
    author: item.author?.name || item.uploadedBy?.name || '',
    duration: item.duration ? `${item.duration.value} ${item.duration.unit}` : '',
    difficulty: item.difficulty || item.difficultyLevel || '',
    rating: item.rating?.average || item.averageRating || 0,
  };

  return snapshot;
};

// ============================================
// @desc    Toggle bookmark (add/remove)
// @route   POST /api/v1/bookmarks/toggle
// @access  Private
// ============================================
exports.toggleBookmark = asyncHandler(async (req, res) => {
  const { itemType, itemId, collection = 'default', tags = [], userNotes } = req.body;

  if (!itemType || !itemId) {
    return ApiResponse.badRequest(res, 'Item type and ID are required.');
  }

  const itemModel = getModelForType(itemType);
  if (!itemModel) {
    return ApiResponse.badRequest(res, 'Invalid item type.');
  }

  // Verify item exists
  const Model = require(`../models/${itemModel}`);
  const item = await Model.findById(itemId);
  if (!item) {
    return ApiResponse.notFound(res, 'Item not found.');
  }

  // Get item snapshot
  const itemSnapshot = await getItemSnapshot(itemType, itemId);

  const result = await Bookmark.toggleBookmark(
    req.user._id,
    itemType,
    itemId,
    itemModel,
    itemSnapshot
  );

  // Update the bookmark with additional data if newly created
  if (result.action === 'added' && result.bookmark) {
    result.bookmark.collection = collection;
    result.bookmark.tags = tags;
    if (userNotes) result.bookmark.userNotes = userNotes;
    await result.bookmark.save();
  }

  return ApiResponse.success(
    res,
    result.action === 'added' ? 'Bookmark added successfully!' : 'Bookmark removed.',
    {
      action: result.action,
      bookmark: result.bookmark,
      isBookmarked: result.action === 'added',
    }
  );
});

// ============================================
// @desc    Get user's bookmarks
// @route   GET /api/v1/bookmarks
// @access  Private
// ============================================
exports.getUserBookmarks = asyncHandler(async (req, res) => {
  const {
    itemType, collection, status, tags,
    isPinned, isFavorite, page = 1, limit = 20,
    sortBy = 'createdAt', sortOrder = 'desc',
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const filter = { user: req.user._id, isArchived: false };

  if (itemType) filter.itemType = itemType;
  if (collection) filter.collections = collection;
  if (status) filter.status = status;
  if (isPinned !== undefined) filter.isPinned = isPinned === 'true';
  if (isFavorite !== undefined) filter.isFavorite = isFavorite === 'true';
  if (tags) {
    const tagsArray = tags.split(',').map((t) => t.trim().toLowerCase());
    filter.tags = { $in: tagsArray };
  }

  const sortOptions = {};
  sortOptions.isPinned = -1;
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const [bookmarks, total] = await Promise.all([
    Bookmark.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit)),
    Bookmark.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, 'Bookmarks fetched.', bookmarks, {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total,
    itemsPerPage: parseInt(limit),
    hasNext: skip + bookmarks.length < total,
    hasPrev: parseInt(page) > 1,
  });
});

// ============================================
// @desc    Get bookmark by ID
// @route   GET /api/v1/bookmarks/:id
// @access  Private
// ============================================
exports.getBookmarkById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bookmark = await Bookmark.findById(id);
  if (!bookmark) {
    return ApiResponse.notFound(res, 'Bookmark not found.');
  }

  if (bookmark.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  // Record access
  bookmark.recordAccess('web').catch(console.error);

  return ApiResponse.success(res, 'Bookmark fetched.', { bookmark });
});

// ============================================
// @desc    Update bookmark
// @route   PUT /api/v1/bookmarks/:id
// @access  Private
// ============================================
exports.updateBookmark = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bookmark = await Bookmark.findById(id);
  if (!bookmark) {
    return ApiResponse.notFound(res, 'Bookmark not found.');
  }

  if (bookmark.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  const allowedFields = [
    'userNotes', 'userRating', 'priority', 'color', 'icon',
    'status', 'collection', 'collections', 'tags', 'folder',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      bookmark[field] = req.body[field];
    }
  });

  await bookmark.save();

  return ApiResponse.success(res, 'Bookmark updated.', { bookmark });
});

// ============================================
// @desc    Delete bookmark
// @route   DELETE /api/v1/bookmarks/:id
// @access  Private
// ============================================
exports.deleteBookmark = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bookmark = await Bookmark.findById(id);
  if (!bookmark) {
    return ApiResponse.notFound(res, 'Bookmark not found.');
  }

  if (bookmark.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  await bookmark.deleteOne();

  return ApiResponse.success(res, 'Bookmark removed.');
});

// ============================================
// @desc    Toggle pin bookmark
// @route   PUT /api/v1/bookmarks/:id/pin
// @access  Private
// ============================================
exports.togglePin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bookmark = await Bookmark.findById(id);
  if (!bookmark) {
    return ApiResponse.notFound(res, 'Bookmark not found.');
  }

  if (bookmark.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  await bookmark.togglePin();

  return ApiResponse.success(res, bookmark.isPinned ? 'Pinned!' : 'Unpinned.', {
    isPinned: bookmark.isPinned,
  });
});

// ============================================
// @desc    Toggle favorite
// @route   PUT /api/v1/bookmarks/:id/favorite
// @access  Private
// ============================================
exports.toggleFavorite = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bookmark = await Bookmark.findById(id);
  if (!bookmark) {
    return ApiResponse.notFound(res, 'Bookmark not found.');
  }

  if (bookmark.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  await bookmark.toggleFavorite();

  return ApiResponse.success(res, bookmark.isFavorite ? 'Added to favorites!' : 'Removed from favorites.', {
    isFavorite: bookmark.isFavorite,
  });
});

// ============================================
// @desc    Archive/Unarchive bookmark
// @route   PUT /api/v1/bookmarks/:id/archive
// @access  Private
// ============================================
exports.archiveBookmark = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { archive = true } = req.body;

  const bookmark = await Bookmark.findById(id);
  if (!bookmark) {
    return ApiResponse.notFound(res, 'Bookmark not found.');
  }

  if (bookmark.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  if (archive) {
    await bookmark.archive();
  } else {
    await bookmark.restore();
  }

  return ApiResponse.success(res, archive ? 'Bookmark archived.' : 'Bookmark restored.');
});

// ============================================
// @desc    Add highlight to bookmark
// @route   POST /api/v1/bookmarks/:id/highlights
// @access  Private
// ============================================
exports.addHighlight = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text, note, color, position } = req.body;

  if (!text || text.trim().length < 1) {
    return ApiResponse.badRequest(res, 'Highlight text is required.');
  }

  const bookmark = await Bookmark.findById(id);
  if (!bookmark) {
    return ApiResponse.notFound(res, 'Bookmark not found.');
  }

  if (bookmark.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  await bookmark.addHighlight(text, note, color, position);

  return ApiResponse.created(res, 'Highlight added.', {
    highlights: bookmark.highlights,
  });
});

// ============================================
// @desc    Add annotation to bookmark
// @route   POST /api/v1/bookmarks/:id/annotations
// @access  Private
// ============================================
exports.addAnnotation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, pageNumber, position } = req.body;

  const bookmark = await Bookmark.findById(id);
  if (!bookmark) {
    return ApiResponse.notFound(res, 'Bookmark not found.');
  }

  if (bookmark.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  await bookmark.addAnnotation(content, pageNumber, position);

  return ApiResponse.created(res, 'Annotation added.');
});

// ============================================
// @desc    Update reading progress
// @route   PUT /api/v1/bookmarks/:id/progress
// @access  Private
// ============================================
exports.updateProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { percentage, position, timeSpent } = req.body;

  if (percentage === undefined || percentage < 0 || percentage > 100) {
    return ApiResponse.badRequest(res, 'Valid percentage (0-100) is required.');
  }

  const bookmark = await Bookmark.findById(id);
  if (!bookmark) {
    return ApiResponse.notFound(res, 'Bookmark not found.');
  }

  if (bookmark.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  await bookmark.updateProgress(percentage, position, timeSpent);

  return ApiResponse.success(res, 'Progress updated.', {
    progress: bookmark.progress,
  });
});

// ============================================
// @desc    Set reminder for bookmark
// @route   POST /api/v1/bookmarks/:id/reminder
// @access  Private
// ============================================
exports.setReminder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { remindAt, frequency = 'once', message = '' } = req.body;

  if (!remindAt || new Date(remindAt) <= new Date()) {
    return ApiResponse.badRequest(res, 'Reminder date must be in the future.');
  }

  const bookmark = await Bookmark.findById(id);
  if (!bookmark) {
    return ApiResponse.notFound(res, 'Bookmark not found.');
  }

  if (bookmark.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  await bookmark.setReminder(new Date(remindAt), frequency, message);

  return ApiResponse.success(res, 'Reminder set successfully!', {
    reminder: bookmark.reminder,
  });
});

// ============================================
// @desc    Get user's collections
// @route   GET /api/v1/bookmarks/collections
// @access  Private
// ============================================
exports.getCollections = asyncHandler(async (req, res) => {
  const collections = await Bookmark.getUserCollections(req.user._id);

  return ApiResponse.success(res, 'Collections fetched.', {
    collections,
    total: collections.length,
  });
});

// ============================================
// @desc    Get pinned bookmarks
// @route   GET /api/v1/bookmarks/pinned
// @access  Private
// ============================================
exports.getPinnedBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await Bookmark.getPinnedBookmarks(req.user._id);

  return ApiResponse.success(res, 'Pinned bookmarks fetched.', {
    bookmarks,
    total: bookmarks.length,
  });
});

// ============================================
// @desc    Get bookmarks with due reminders
// @route   GET /api/v1/bookmarks/reminders/due
// @access  Private
// ============================================
exports.getDueReminders = asyncHandler(async (req, res) => {
  const bookmarks = await Bookmark.getDueReminders(req.user._id);

  return ApiResponse.success(res, 'Due reminders fetched.', {
    bookmarks,
    total: bookmarks.length,
  });
});

// ============================================
// @desc    Get bookmark statistics
// @route   GET /api/v1/bookmarks/stats
// @access  Private
// ============================================
exports.getBookmarkStats = asyncHandler(async (req, res) => {
  const stats = await Bookmark.getUserStats(req.user._id);

  const totalActive = await Bookmark.countDocuments({
    user: req.user._id,
    isArchived: false,
  });

  const totalArchived = await Bookmark.countDocuments({
    user: req.user._id,
    isArchived: true,
  });

  const totalPinned = await Bookmark.countDocuments({
    user: req.user._id,
    isPinned: true,
  });

  return ApiResponse.success(res, 'Bookmark stats fetched.', {
    total: totalActive + totalArchived,
    active: totalActive,
    archived: totalArchived,
    pinned: totalPinned,
    byType: stats,
  });
});

// ============================================
// @desc    Search bookmarks
// @route   GET /api/v1/bookmarks/search
// @access  Private
// ============================================
exports.searchBookmarks = asyncHandler(async (req, res) => {
  const { q, limit = 20 } = req.query;

  if (!q || q.trim().length < 2) {
    return ApiResponse.badRequest(res, 'Search query must be at least 2 characters.');
  }

  const bookmarks = await Bookmark.searchBookmarks(req.user._id, q).limit(parseInt(limit));

  return ApiResponse.success(res, 'Search results fetched.', {
    query: q,
    bookmarks,
    total: bookmarks.length,
  });
});

// ============================================
// @desc    Check if item is bookmarked
// @route   GET /api/v1/bookmarks/check
// @access  Private
// ============================================
exports.checkBookmarked = asyncHandler(async (req, res) => {
  const { itemType, itemId } = req.query;

  if (!itemType || !itemId) {
    return ApiResponse.badRequest(res, 'Item type and ID are required.');
  }

  const isBookmarked = await Bookmark.isBookmarked(req.user._id, itemType, itemId);

  return ApiResponse.success(res, 'Bookmark status checked.', {
    isBookmarked,
    itemType,
    itemId,
  });
});

// ============================================
// @desc    Share bookmark with user
// @route   POST /api/v1/bookmarks/:id/share
// @access  Private
// ============================================
exports.shareBookmark = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, permission = 'view' } = req.body;

  const bookmark = await Bookmark.findById(id);
  if (!bookmark) {
    return ApiResponse.notFound(res, 'Bookmark not found.');
  }

  if (bookmark.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return ApiResponse.notFound(res, 'User not found.');
  }

  await bookmark.shareWithUser(userId, permission);

  return ApiResponse.success(res, `Bookmark shared with ${targetUser.name}.`);
});

// ============================================
// @desc    Generate share link
// @route   POST /api/v1/bookmarks/:id/share-link
// @access  Private
// ============================================
exports.generateShareLink = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { expiresInDays = 30 } = req.body;

  const bookmark = await Bookmark.findById(id);
  if (!bookmark) {
    return ApiResponse.notFound(res, 'Bookmark not found.');
  }

  if (bookmark.user.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  const token = await bookmark.generateShareLink(expiresInDays);

  const shareUrl = `${process.env.CLIENT_URL}/shared/bookmark/${token}`;

  return ApiResponse.success(res, 'Share link generated.', {
    shareUrl,
    token,
    expiresAt: bookmark.shareLink.expiresAt,
  });
});

// ============================================
// @desc    Bulk delete bookmarks
// @route   DELETE /api/v1/bookmarks/bulk
// @access  Private
// ============================================
exports.bulkDeleteBookmarks = asyncHandler(async (req, res) => {
  const { bookmarkIds } = req.body;

  if (!Array.isArray(bookmarkIds) || bookmarkIds.length === 0) {
    return ApiResponse.badRequest(res, 'Please provide bookmark IDs to delete.');
  }

  const result = await Bookmark.deleteMany({
    _id: { $in: bookmarkIds },
    user: req.user._id,
  });

  return ApiResponse.success(res, `${result.deletedCount} bookmarks deleted.`);
});