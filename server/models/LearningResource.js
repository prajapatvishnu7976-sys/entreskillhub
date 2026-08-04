// ============================================
// EntreSkillHub - Learning Resource Model
// Videos, Articles, Checklists, Guides
// ============================================

const mongoose = require('mongoose');
const slugify = require('slugify');

const learningResourceSchema = new mongoose.Schema(
  {
    // ============================================
    // Basic Information
    // ============================================
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, 'Subtitle cannot exceed 300 characters'],
      default: '',
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },

    shortDescription: {
      type: String,
      trim: true,
      maxlength: [200, 'Short description cannot exceed 200 characters'],
      default: '',
    },

    // ============================================
    // Resource Type
    // ============================================
    resourceType: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: {
        values: [
          'video',
          'article',
          'checklist',
          'guide',
          'template',
          'tool',
          'course',
          'ebook',
          'infographic',
          'podcast',
          'webinar',
          'case_study',
          'worksheet',
          'quiz',
        ],
        message: '{VALUE} is not a valid resource type',
      },
      index: true,
    },

    format: {
      type: String,
      enum: ['text', 'video', 'audio', 'pdf', 'interactive', 'image', 'mixed'],
      default: 'text',
    },

    // ============================================
    // Categorization
    // ============================================
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Business Basics',
        'Marketing',
        'Sales',
        'Finance',
        'Legal & Compliance',
        'Operations',
        'HR & Team',
        'Technology',
        'Product Development',
        'Customer Service',
        'Strategy',
        'Leadership',
        'Skill Development',
        'Personal Development',
        'Industry Insights',
        'Success Stories',
        'Tools & Resources',
      ],
      index: true,
    },

    subCategory: {
      type: String,
      trim: true,
      default: '',
    },

    topics: [
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

    // ============================================
    // Content
    // ============================================
    content: {
      // For articles/guides (rich text HTML)
      body: {
        type: String,
        default: '',
      },

      // For videos
      videoUrl: {
        type: String,
        default: '',
      },
      videoProvider: {
        type: String,
        enum: ['youtube', 'vimeo', 'custom', 'cloudinary', 'other'],
        default: 'youtube',
      },
      videoDuration: {
        type: Number, // in seconds
        default: 0,
      },
      videoTranscript: {
        type: String,
        default: '',
      },

      // For downloadable resources
      downloadUrl: {
        type: String,
        default: '',
      },
      fileSize: {
        type: Number, // in bytes
        default: 0,
      },
      fileFormat: {
        type: String,
        default: '',
      },

      // For podcasts/audio
      audioUrl: {
        type: String,
        default: '',
      },
      audioDuration: {
        type: Number,
        default: 0,
      },

      // For checklists
      checklistItems: [
        {
          item: {
            type: String,
            required: true,
          },
          description: String,
          isRequired: {
            type: Boolean,
            default: true,
          },
          category: String,
          order: {
            type: Number,
            default: 0,
          },
        },
      ],

      // For templates
      templateType: {
        type: String,
        enum: ['business_plan', 'invoice', 'contract', 'proposal', 'budget', 'marketing_plan', 'other'],
      },
      templateUrl: String,

      // For courses (multi-lesson)
      lessons: [
        {
          lessonNumber: Number,
          title: String,
          description: String,
          duration: Number,
          videoUrl: String,
          content: String,
          resources: [String],
        },
      ],

      // For quizzes
      questions: [
        {
          question: String,
          type: {
            type: String,
            enum: ['multiple_choice', 'true_false', 'short_answer'],
          },
          options: [String],
          correctAnswer: String,
          explanation: String,
          points: {
            type: Number,
            default: 1,
          },
        },
      ],
    },

    // ============================================
    // Media
    // ============================================
    thumbnail: {
      url: {
        type: String,
        default: '',
      },
      publicId: {
        type: String,
        default: null,
      },
      alt: String,
    },

    gallery: [
      {
        url: String,
        publicId: String,
        caption: String,
      },
    ],

    // ============================================
    // Metadata
    // ============================================
    duration: {
      value: {
        type: Number,
        min: 0,
        default: 0,
      },
      unit: {
        type: String,
        enum: ['minutes', 'hours', 'days'],
        default: 'minutes',
      },
    },

    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
      index: true,
    },

    language: {
      type: String,
      enum: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa'],
      default: 'en',
      index: true,
    },

    availableLanguages: [
      {
        language: String,
        url: String,
        title: String,
      },
    ],

    // ============================================
    // Author & Source
    // ============================================
    author: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      bio: String,
      image: String,
      credentials: String,
      socialLinks: {
        linkedin: String,
        twitter: String,
        website: String,
      },
    },

    source: {
      name: String,
      url: String,
      type: {
        type: String,
        enum: ['internal', 'external', 'affiliate', 'partner'],
        default: 'internal',
      },
    },

    // ============================================
    // Learning Objectives
    // ============================================
    learningObjectives: [
      {
        objective: String,
        description: String,
      },
    ],

    prerequisites: [
      {
        type: String,
        trim: true,
      },
    ],

    keyTakeaways: [
      {
        type: String,
        trim: true,
      },
    ],

    // ============================================
    // Association
    // ============================================
    relatedSkills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],

    relatedBusinessIdeas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusinessIdea',
      },
    ],

    relatedRoadmaps: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Roadmap',
      },
    ],

    relatedResources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearningResource',
      },
    ],

    // Series (for multi-part content)
    series: {
      name: String,
      part: Number,
      totalParts: Number,
      previousResource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearningResource',
      },
      nextResource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearningResource',
      },
    },

    // ============================================
    // Target Audience
    // ============================================
    targetAudience: [
      {
        type: String,
        enum: [
          'beginners',
          'aspiring_entrepreneurs',
          'existing_business_owners',
          'students',
          'women_entrepreneurs',
          'rural_entrepreneurs',
          'youth',
          'freelancers',
          'side_hustlers',
          'all',
        ],
      },
    ],

    // ============================================
    // Access & Pricing
    // ============================================
    access: {
      type: String,
      enum: ['free', 'premium', 'paid', 'members_only'],
      default: 'free',
      index: true,
    },

    price: {
      amount: {
        type: Number,
        min: 0,
        default: 0,
      },
      currency: {
        type: String,
        default: 'INR',
      },
      discountedPrice: Number,
      discountValidTill: Date,
    },

    // ============================================
    // Statistics & Engagement
    // ============================================
    stats: {
      viewCount: {
        type: Number,
        default: 0,
      },
      completionCount: {
        type: Number,
        default: 0,
      },
      bookmarkCount: {
        type: Number,
        default: 0,
      },
      shareCount: {
        type: Number,
        default: 0,
      },
      downloadCount: {
        type: Number,
        default: 0,
      },
      likeCount: {
        type: Number,
        default: 0,
      },
      commentCount: {
        type: Number,
        default: 0,
      },
      averageTimeSpent: {
        type: Number, // in seconds
        default: 0,
      },
    },

    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      total: {
        type: Number,
        default: 0,
      },
      distribution: {
        five: { type: Number, default: 0 },
        four: { type: Number, default: 0 },
        three: { type: Number, default: 0 },
        two: { type: Number, default: 0 },
        one: { type: Number, default: 0 },
      },
    },

    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        title: String,
        comment: String,
        helpful: {
          type: Number,
          default: 0,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        content: {
          type: String,
          required: true,
          maxlength: 1000,
        },
        parentComment: {
          type: mongoose.Schema.Types.ObjectId,
        },
        likes: {
          type: Number,
          default: 0,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ============================================
    // Content Quality & Moderation
    // ============================================
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'approved', 'rejected', 'archived'],
      default: 'pending_review',
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    isEditorsPick: {
      type: Boolean,
      default: false,
    },

    isTrending: {
      type: Boolean,
      default: false,
    },

    isPopular: {
      type: Boolean,
      default: false,
    },

    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    verifiedAccuracy: {
      type: Boolean,
      default: false,
    },

    // ============================================
    // Publishing
    // ============================================
    publishedAt: {
      type: Date,
      default: null,
    },

    scheduledFor: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    // ============================================
    // Uploader & Verification
    // ============================================
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    uploaderRole: {
      type: String,
      enum: ['admin', 'mentor', 'user'],
      required: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: '',
    },

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // ============================================
    // Reporting & Flags
    // ============================================
    reports: [
      {
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: {
          type: String,
          enum: ['inappropriate', 'inaccurate', 'spam', 'copyright', 'offensive', 'other'],
        },
        description: String,
        status: {
          type: String,
          enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
          default: 'pending',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    reportCount: {
      type: Number,
      default: 0,
    },

    // ============================================
    // SEO
    // ============================================
    seo: {
      metaTitle: {
        type: String,
        maxlength: 60,
      },
      metaDescription: {
        type: String,
        maxlength: 160,
      },
      keywords: [String],
      canonicalUrl: String,
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
learningResourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
learningResourceSchema.index({ resourceType: 1, category: 1 });
learningResourceSchema.index({ 'stats.viewCount': -1 });
learningResourceSchema.index({ 'rating.average': -1 });
learningResourceSchema.index({ publishedAt: -1 });
learningResourceSchema.index({ createdAt: -1 });

// ============================================
// Virtual Fields
// ============================================

// Duration in readable format
learningResourceSchema.virtual('durationText').get(function () {
  if (!this.duration.value) return 'N/A';
  return `${this.duration.value} ${this.duration.unit}`;
});

// Is free
learningResourceSchema.virtual('isFree').get(function () {
  return this.access === 'free' || this.price.amount === 0;
});

// Engagement score
learningResourceSchema.virtual('engagementScore').get(function () {
  const views = this.stats.viewCount || 0;
  const likes = this.stats.likeCount || 0;
  const shares = this.stats.shareCount || 0;
  const completions = this.stats.completionCount || 0;
  return Math.round((likes * 2 + shares * 3 + completions * 4 + views * 0.1));
});

// URL
learningResourceSchema.virtual('url').get(function () {
  return `/resources/${this.slug}`;
});

// ============================================
// Pre-save Middleware
// ============================================

// Generate slug
learningResourceSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
  next();
});

// Set published date when status becomes approved
learningResourceSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'approved' && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  next();
});

// Auto SEO
learningResourceSchema.pre('save', function (next) {
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = `${this.title} | EntreSkillHub Learning`.substring(0, 60);
  }
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = this.shortDescription || this.description.substring(0, 160);
  }
  next();
});

// ============================================
// Instance Methods
// ============================================

// Increment views
learningResourceSchema.methods.incrementViews = async function () {
  this.stats.viewCount += 1;
  return await this.save({ validateBeforeSave: false });
};

// Add rating
learningResourceSchema.methods.addRating = async function (userId, rating, title, comment) {
  const existingReviewIndex = this.reviews.findIndex(
    (r) => r.user.toString() === userId.toString()
  );

  if (existingReviewIndex !== -1) {
    // Update existing review
    const oldRating = this.reviews[existingReviewIndex].rating;
    this.reviews[existingReviewIndex] = {
      user: userId,
      rating,
      title,
      comment,
      createdAt: this.reviews[existingReviewIndex].createdAt,
    };

    // Recalculate distribution
    const stars = ['one', 'two', 'three', 'four', 'five'];
    this.rating.distribution[stars[oldRating - 1]] -= 1;
    this.rating.distribution[stars[rating - 1]] += 1;

    // Recalculate average
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating.average = total / this.reviews.length;
  } else {
    // Add new review
    this.reviews.push({ user: userId, rating, title, comment });
    const currentTotal = this.rating.average * this.rating.total;
    this.rating.total += 1;
    this.rating.average = (currentTotal + rating) / this.rating.total;

    const stars = ['one', 'two', 'three', 'four', 'five'];
    this.rating.distribution[stars[rating - 1]] += 1;
  }

  return await this.save({ validateBeforeSave: false });
};

// Add comment
learningResourceSchema.methods.addComment = async function (userId, content, parentComment = null) {
  this.comments.push({ user: userId, content, parentComment });
  this.stats.commentCount = this.comments.length;
  return await this.save({ validateBeforeSave: false });
};

// Mark completion
learningResourceSchema.methods.markCompletion = async function () {
  this.stats.completionCount += 1;
  return await this.save({ validateBeforeSave: false });
};

// Report content
learningResourceSchema.methods.reportContent = async function (userId, reason, description) {
  this.reports.push({ reportedBy: userId, reason, description });
  this.reportCount += 1;
  return await this.save({ validateBeforeSave: false });
};

// ============================================
// Static Methods
// ============================================

// Get by type
learningResourceSchema.statics.getByType = function (resourceType, limit = 20) {
  return this.find({
    resourceType,
    isActive: true,
    status: 'approved',
  })
    .sort({ 'stats.viewCount': -1 })
    .limit(limit);
};

// Get featured
learningResourceSchema.statics.getFeatured = function (limit = 10) {
  return this.find({
    isFeatured: true,
    isActive: true,
    status: 'approved',
  })
    .sort({ 'rating.average': -1 })
    .limit(limit);
};

// Get trending
learningResourceSchema.statics.getTrending = function (limit = 10) {
  return this.find({
    isTrending: true,
    isActive: true,
    status: 'approved',
  })
    .sort({ 'stats.viewCount': -1 })
    .limit(limit);
};

// Get free resources
learningResourceSchema.statics.getFreeResources = function (limit = 20) {
  return this.find({
    access: 'free',
    isActive: true,
    status: 'approved',
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Search resources
learningResourceSchema.statics.searchResources = function (query, filters = {}) {
  return this.find({
    $and: [
      { isActive: true, status: 'approved' },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
        ],
      },
      filters,
    ],
  });
};

// ============================================
// Export Model
// ============================================
const LearningResource = mongoose.model('LearningResource', learningResourceSchema);

module.exports = LearningResource;