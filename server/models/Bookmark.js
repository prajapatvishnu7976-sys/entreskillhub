// ============================================
// EntreSkillHub - Bookmark Model
// User saved items across the platform
// ============================================

const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    // ============================================
    // User Reference
    // ============================================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },

    // ============================================
    // Bookmarked Item
    // ============================================
    itemType: {
      type: String,
      required: [true, 'Item type is required'],
      enum: {
        values: [
          'business_idea',
          'roadmap',
          'learning_resource',
          'mentor',
          'skill',
          'article',
          'video',
          'checklist',
          'session',
          'user',
        ],
        message: '{VALUE} is not a valid item type',
      },
      index: true,
    },

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Item ID is required'],
      refPath: 'itemModel',
      index: true,
    },

    itemModel: {
      type: String,
      required: true,
      enum: [
        'BusinessIdea',
        'Roadmap',
        'LearningResource',
        'Mentor',
        'Skill',
        'MentorSession',
        'User',
      ],
    },

    // ============================================
    // Cached Item Data (for performance)
    // ============================================
    itemSnapshot: {
      title: {
        type: String,
        required: true,
      },
      description: String,
      shortDescription: String,
      imageUrl: String,
      url: String,
      category: String,
      author: String,
      duration: String,
      difficulty: String,
      rating: Number,
      metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
      },
    },

    // ============================================
    // Organization
    // ============================================
    collection: {
      type: String,
      trim: true,
      default: 'default',
      index: true,
    },

    collections: [
      {
        type: String,
        trim: true,
      },
    ],

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    folder: {
      type: String,
      default: null,
    },

    // ============================================
    // User Personalization
    // ============================================
    userNotes: {
      type: String,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
      default: '',
    },

    userRating: {
      type: Number,
      min: 1,
      max: 5,
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    color: {
      type: String,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color code'],
      default: '#3B82F6',
    },

    icon: {
      type: String,
      default: '⭐',
    },

    // ============================================
    // Status & Flags
    // ============================================
    status: {
      type: String,
      enum: ['active', 'archived', 'to_read', 'reading', 'read', 'important'],
      default: 'active',
      index: true,
    },

    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },

    isFavorite: {
      type: Boolean,
      default: false,
    },

    isPrivate: {
      type: Boolean,
      default: true,
    },

    isShared: {
      type: Boolean,
      default: false,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },

    // ============================================
    // Reminders
    // ============================================
    reminder: {
      isSet: {
        type: Boolean,
        default: false,
      },
      remindAt: {
        type: Date,
        default: null,
      },
      frequency: {
        type: String,
        enum: ['once', 'daily', 'weekly', 'monthly'],
        default: 'once',
      },
      message: {
        type: String,
        default: '',
      },
      isCompleted: {
        type: Boolean,
        default: false,
      },
      lastReminded: Date,
    },

    // ============================================
    // Reading Progress (for articles/videos)
    // ============================================
    progress: {
      isStarted: {
        type: Boolean,
        default: false,
      },
      percentageCompleted: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      lastPosition: {
        type: Number, // For videos - in seconds
        default: 0,
      },
      timeSpent: {
        type: Number, // in seconds
        default: 0,
      },
      startedAt: Date,
      completedAt: Date,
      lastReadAt: {
        type: Date,
        default: Date.now,
      },
    },

    // ============================================
    // Highlights & Annotations
    // ============================================
    highlights: [
      {
        text: {
          type: String,
          required: true,
          maxlength: 1000,
        },
        note: {
          type: String,
          maxlength: 1000,
        },
        color: {
          type: String,
          default: 'yellow',
        },
        position: Number, // For videos - timestamp
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    annotations: [
      {
        content: {
          type: String,
          required: true,
        },
        pageNumber: Number,
        position: {
          x: Number,
          y: Number,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ============================================
    // Sharing
    // ============================================
    sharedWith: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        permission: {
          type: String,
          enum: ['view', 'edit'],
          default: 'view',
        },
        sharedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    shareLink: {
      isEnabled: {
        type: Boolean,
        default: false,
      },
      token: String,
      expiresAt: Date,
      views: {
        type: Number,
        default: 0,
      },
    },

    // ============================================
    // Access History
    // ============================================
    accessHistory: [
      {
        accessedAt: {
          type: Date,
          default: Date.now,
        },
        device: String,
        duration: Number, // in seconds
      },
    ],

    accessCount: {
      type: Number,
      default: 0,
    },

    lastAccessedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // ============================================
    // Grouping & Relations
    // ============================================
    relatedBookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bookmark',
      },
    ],

    parentBookmark: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bookmark',
      default: null,
    },

    // ============================================
    // Metadata
    // ============================================
    source: {
      type: String,
      enum: ['manual', 'auto_save', 'recommendation', 'shared'],
      default: 'manual',
    },

    bookmarkedFrom: {
      page: String,
      referrer: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// Indexes
// ============================================
bookmarkSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, collection: 1 });
bookmarkSchema.index({ user: 1, isPinned: -1, createdAt: -1 });
bookmarkSchema.index({ user: 1, tags: 1 });
bookmarkSchema.index({ lastAccessedAt: -1 });

// ============================================
// Virtual Fields
// ============================================

// Days since bookmarked
bookmarkSchema.virtual('daysSinceBookmarked').get(function () {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Is stale (not accessed for 90 days)
bookmarkSchema.virtual('isStale').get(function () {
  const daysSinceLastAccess = (Date.now() - this.lastAccessedAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceLastAccess > 90;
});

// Has reminder due
bookmarkSchema.virtual('hasReminderDue').get(function () {
  if (!this.reminder.isSet || this.reminder.isCompleted) return false;
  return this.reminder.remindAt && this.reminder.remindAt <= new Date();
});

// ============================================
// Pre-save Middleware
// ============================================

// Auto-add to collections
bookmarkSchema.pre('save', function (next) {
  if (this.collection && !this.collections.includes(this.collection)) {
    this.collections.push(this.collection);
  }
  next();
});

// Update lastAccessedAt when accessed
bookmarkSchema.pre('save', function (next) {
  if (this.isModified('accessCount')) {
    this.lastAccessedAt = Date.now();
  }
  next();
});

// ============================================
// Instance Methods
// ============================================

// Record access
bookmarkSchema.methods.recordAccess = async function (device = 'web', duration = 0) {
  this.accessCount += 1;
  this.lastAccessedAt = Date.now();

  this.accessHistory.push({ device, duration });

  // Keep only last 20 access records
  if (this.accessHistory.length > 20) {
    this.accessHistory = this.accessHistory.slice(-20);
  }

  return await this.save();
};

// Update progress
bookmarkSchema.methods.updateProgress = async function (percentage, position, timeSpent) {
  this.progress.percentageCompleted = percentage;
  if (position !== undefined) this.progress.lastPosition = position;
  if (timeSpent !== undefined) this.progress.timeSpent += timeSpent;

  if (!this.progress.isStarted) {
    this.progress.isStarted = true;
    this.progress.startedAt = Date.now();
  }

  if (percentage >= 100 && !this.progress.completedAt) {
    this.progress.completedAt = Date.now();
    this.status = 'read';
  }

  this.progress.lastReadAt = Date.now();
  return await this.save();
};

// Add highlight
bookmarkSchema.methods.addHighlight = async function (text, note, color = 'yellow', position) {
  this.highlights.push({ text, note, color, position });
  return await this.save();
};

// Add annotation
bookmarkSchema.methods.addAnnotation = async function (content, pageNumber, position) {
  this.annotations.push({ content, pageNumber, position });
  return await this.save();
};

// Toggle pin
bookmarkSchema.methods.togglePin = async function () {
  this.isPinned = !this.isPinned;
  return await this.save();
};

// Toggle favorite
bookmarkSchema.methods.toggleFavorite = async function () {
  this.isFavorite = !this.isFavorite;
  return await this.save();
};

// Add to collection
bookmarkSchema.methods.addToCollection = async function (collectionName) {
  if (!this.collections.includes(collectionName)) {
    this.collections.push(collectionName);
  }
  return await this.save();
};

// Remove from collection
bookmarkSchema.methods.removeFromCollection = async function (collectionName) {
  this.collections = this.collections.filter((c) => c !== collectionName);
  return await this.save();
};

// Set reminder
bookmarkSchema.methods.setReminder = async function (remindAt, frequency = 'once', message = '') {
  this.reminder = {
    isSet: true,
    remindAt,
    frequency,
    message,
    isCompleted: false,
  };
  return await this.save();
};

// Share with user
bookmarkSchema.methods.shareWithUser = async function (userId, permission = 'view') {
  const existing = this.sharedWith.find((s) => s.user.toString() === userId.toString());
  if (!existing) {
    this.sharedWith.push({ user: userId, permission });
    this.isShared = true;
    return await this.save();
  }
  existing.permission = permission;
  return await this.save();
};

// Generate share link
bookmarkSchema.methods.generateShareLink = async function (expiresInDays = 30) {
  const crypto = require('crypto');
  this.shareLink = {
    isEnabled: true,
    token: crypto.randomBytes(16).toString('hex'),
    expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
    views: 0,
  };
  await this.save();
  return this.shareLink.token;
};

// Archive bookmark
bookmarkSchema.methods.archive = async function () {
  this.isArchived = true;
  this.status = 'archived';
  return await this.save();
};

// Restore from archive
bookmarkSchema.methods.restore = async function () {
  this.isArchived = false;
  this.status = 'active';
  return await this.save();
};

// ============================================
// Static Methods
// ============================================

// Toggle bookmark (create if not exists, remove if exists)
bookmarkSchema.statics.toggleBookmark = async function (userId, itemType, itemId, itemModel, itemSnapshot) {
  const existing = await this.findOne({ user: userId, itemType, itemId });

  if (existing) {
    await existing.deleteOne();
    return { action: 'removed', bookmark: null };
  }

  const bookmark = await this.create({
    user: userId,
    itemType,
    itemId,
    itemModel,
    itemSnapshot,
  });

  return { action: 'added', bookmark };
};

// Get user's bookmarks by type
bookmarkSchema.statics.getUserBookmarks = function (userId, itemType = null, options = {}) {
  const query = { user: userId, isArchived: false };
  if (itemType) query.itemType = itemType;

  const {
    collection,
    tags,
    status,
    limit = 20,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = -1,
  } = options;

  if (collection) query.collections = collection;
  if (tags && tags.length > 0) query.tags = { $in: tags };
  if (status) query.status = status;

  return this.find(query)
    .sort({ isPinned: -1, [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
};

// Get pinned bookmarks
bookmarkSchema.statics.getPinnedBookmarks = function (userId) {
  return this.find({ user: userId, isPinned: true, isArchived: false })
    .sort({ createdAt: -1 });
};

// Get bookmarks with due reminders
bookmarkSchema.statics.getDueReminders = function (userId) {
  return this.find({
    user: userId,
    'reminder.isSet': true,
    'reminder.isCompleted': false,
    'reminder.remindAt': { $lte: new Date() },
  });
};

// Get user collections
bookmarkSchema.statics.getUserCollections = async function (userId) {
  return await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), isArchived: false } },
    { $unwind: '$collections' },
    {
      $group: {
        _id: '$collections',
        count: { $sum: 1 },
        lastAdded: { $max: '$createdAt' },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Get bookmark statistics
bookmarkSchema.statics.getUserStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$itemType',
        count: { $sum: 1 },
        archived: { $sum: { $cond: [{ $eq: ['$isArchived', true] }, 1, 0] } },
        pinned: { $sum: { $cond: [{ $eq: ['$isPinned', true] }, 1, 0] } },
      },
    },
  ]);

  return stats;
};

// Check if item is bookmarked
bookmarkSchema.statics.isBookmarked = async function (userId, itemType, itemId) {
  const bookmark = await this.findOne({ user: userId, itemType, itemId });
  return !!bookmark;
};

// Search bookmarks
bookmarkSchema.statics.searchBookmarks = function (userId, query) {
  return this.find({
    user: userId,
    isArchived: false,
    $or: [
      { 'itemSnapshot.title': { $regex: query, $options: 'i' } },
      { 'itemSnapshot.description': { $regex: query, $options: 'i' } },
      { userNotes: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } },
    ],
  });
};

// ============================================
// Export Model
// ============================================
const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;