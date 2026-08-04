// ============================================
// EntreSkillHub - Feedback Model
// User feedback, reports, and platform reviews
// ============================================

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    // ============================================
    // Feedback Provider
    // ============================================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },

    isAnonymous: {
      type: Boolean,
      default: false,
    },

    // ============================================
    // Feedback Type & Category
    // ============================================
    feedbackType: {
      type: String,
      required: [true, 'Feedback type is required'],
      enum: {
        values: [
          'general',
          'bug_report',
          'feature_request',
          'complaint',
          'compliment',
          'suggestion',
          'question',
          'content_feedback',
          'mentor_feedback',
          'platform_review',
          'testimonial',
        ],
        message: '{VALUE} is not a valid feedback type',
      },
      index: true,
    },

    category: {
      type: String,
      enum: [
        'user_experience',
        'content_quality',
        'mentor_service',
        'technical_issue',
        'payment',
        'account',
        'business_ideas',
        'roadmaps',
        'learning_resources',
        'mobile_responsive',
        'notifications',
        'search',
        'performance',
        'accessibility',
        'other',
      ],
      default: 'other',
      index: true,
    },

    subCategory: {
      type: String,
      default: '',
    },

    // ============================================
    // Feedback Content
    // ============================================
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      minlength: [5, 'Subject must be at least 5 characters'],
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },

    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },

    // ============================================
    // Rating (if applicable)
    // ============================================
    rating: {
      overall: {
        type: Number,
        min: 1,
        max: 5,
      },
      usability: {
        type: Number,
        min: 1,
        max: 5,
      },
      contentQuality: {
        type: Number,
        min: 1,
        max: 5,
      },
      design: {
        type: Number,
        min: 1,
        max: 5,
      },
      performance: {
        type: Number,
        min: 1,
        max: 5,
      },
      support: {
        type: Number,
        min: 1,
        max: 5,
      },
      recommendationScore: {
        type: Number,
        min: 0,
        max: 10,
      },
    },

    // ============================================
    // Priority & Urgency
    // ============================================
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'medium',
      index: true,
    },

    severity: {
      type: String,
      enum: ['minor', 'moderate', 'major', 'critical'],
      default: 'moderate',
    },

    // ============================================
    // Related Entities
    // ============================================
    relatedEntity: {
      entityType: {
        type: String,
        enum: [
          'user',
          'mentor',
          'business_idea',
          'roadmap',
          'learning_resource',
          'session',
          'platform',
          'other',
        ],
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedEntity.entityType',
      },
      entityName: String,
      entityUrl: String,
    },

    // ============================================
    // Bug Report Specific
    // ============================================
    bugDetails: {
      stepsToReproduce: [String],
      expectedBehavior: {
        type: String,
        maxlength: 1000,
      },
      actualBehavior: {
        type: String,
        maxlength: 1000,
      },
      frequency: {
        type: String,
        enum: ['always', 'often', 'sometimes', 'rarely', 'once'],
      },
      workaround: {
        type: String,
        maxlength: 1000,
      },
    },

    // ============================================
    // Feature Request Specific
    // ============================================
    featureRequest: {
      problemStatement: {
        type: String,
        maxlength: 1000,
      },
      proposedSolution: {
        type: String,
        maxlength: 2000,
      },
      benefits: [String],
      useCase: {
        type: String,
        maxlength: 1000,
      },
      priority: {
        type: String,
        enum: ['nice_to_have', 'should_have', 'must_have'],
        default: 'nice_to_have',
      },
      votes: {
        type: Number,
        default: 0,
      },
      voters: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },

    // ============================================
    // Attachments
    // ============================================
    attachments: [
      {
        type: {
          type: String,
          enum: ['screenshot', 'video', 'document', 'log', 'other'],
        },
        name: String,
        url: {
          type: String,
          required: true,
        },
        publicId: String,
        size: Number,
        mimeType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ============================================
    // Device & Browser Info
    // ============================================
    technicalInfo: {
      browser: String,
      browserVersion: String,
      os: String,
      osVersion: String,
      deviceType: {
        type: String,
        enum: ['desktop', 'tablet', 'mobile', 'other'],
      },
      deviceModel: String,
      screenResolution: String,
      userAgent: String,
      ipAddress: String,
      url: String, // Page where feedback was submitted
      referrer: String,
    },

    // ============================================
    // Status & Handling
    // ============================================
    status: {
      type: String,
      enum: {
        values: [
          'new',
          'acknowledged',
          'in_progress',
          'pending_user',
          'resolved',
          'closed',
          'reopened',
          'duplicate',
          'wont_fix',
        ],
        message: '{VALUE} is not a valid status',
      },
      default: 'new',
      index: true,
    },

    statusHistory: [
      {
        status: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        note: String,
      },
    ],

    // ============================================
    // Assignment & Response
    // ============================================
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    assignedAt: {
      type: Date,
      default: null,
    },

    responses: [
      {
        respondedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        message: {
          type: String,
          required: true,
          maxlength: 5000,
        },
        isInternal: {
          type: Boolean,
          default: false,
        },
        attachments: [
          {
            name: String,
            url: String,
          },
        ],
        respondedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    lastResponseAt: {
      type: Date,
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    resolution: {
      type: String,
      maxlength: 3000,
      default: '',
    },

    resolutionType: {
      type: String,
      enum: [
        'fixed',
        'implemented',
        'explained',
        'workaround_provided',
        'duplicate',
        'not_reproducible',
        'wont_fix',
        'user_error',
        'other',
      ],
    },

    // ============================================
    // User Satisfaction
    // ============================================
    satisfaction: {
      isSatisfied: {
        type: Boolean,
        default: null,
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      submittedAt: Date,
    },

    // ============================================
    // Internal Notes & Tags
    // ============================================
    internalNotes: [
      {
        note: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    labels: [String],

    // ============================================
    // Duplicate Detection
    // ============================================
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback',
      default: null,
    },

    duplicates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feedback',
      },
    ],

    similarFeedback: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feedback',
      },
    ],

    // ============================================
    // Public Testimonials
    // ============================================
    isTestimonial: {
      type: Boolean,
      default: false,
    },

    isPublic: {
      type: Boolean,
      default: false,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    displayOnHomepage: {
      type: Boolean,
      default: false,
    },

    // ============================================
    // SLA & Response Time
    // ============================================
    sla: {
      responseTarget: {
        type: Number, // in hours
        default: 24,
      },
      resolutionTarget: {
        type: Number, // in hours
        default: 72,
      },
      firstResponseTime: Number, // Actual first response time in hours
      resolutionTime: Number, // Actual resolution time in hours
      isBreached: {
        type: Boolean,
        default: false,
      },
    },

    // ============================================
    // Community Interaction
    // ============================================
    upvotes: {
      type: Number,
      default: 0,
    },

    downvotes: {
      type: Number,
      default: 0,
    },

    voters: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        vote: {
          type: String,
          enum: ['up', 'down'],
        },
        votedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    viewCount: {
      type: Number,
      default: 0,
    },

    // ============================================
    // Notifications
    // ============================================
    notifications: {
      emailUser: {
        type: Boolean,
        default: true,
      },
      lastNotifiedAt: Date,
      notificationsSent: [
        {
          type: {
            type: String,
            enum: ['acknowledged', 'in_progress', 'resolved', 'response_added'],
          },
          sentAt: {
            type: Date,
            default: Date.now,
          },
          channel: String,
        },
      ],
    },

    // ============================================
    // Metadata
    // ============================================
    source: {
      type: String,
      enum: ['web', 'mobile', 'email', 'admin', 'api', 'chatbot'],
      default: 'web',
    },

    submittedFrom: {
      page: String,
      section: String,
      component: String,
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
feedbackSchema.index({ user: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, priority: 1 });
feedbackSchema.index({ feedbackType: 1, category: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ subject: 'text', message: 'text' });

// ============================================
// Virtual Fields
// ============================================

// Age of feedback in hours
feedbackSchema.virtual('ageInHours').get(function () {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60));
});

// Time to resolution
feedbackSchema.virtual('timeToResolution').get(function () {
  if (!this.resolvedAt) return null;
  return Math.floor((this.resolvedAt.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60));
});

// Is overdue
feedbackSchema.virtual('isOverdue').get(function () {
  if (this.status === 'resolved' || this.status === 'closed') return false;
  return this.ageInHours > this.sla.resolutionTarget;
});

// Net vote score
feedbackSchema.virtual('voteScore').get(function () {
  return this.upvotes - this.downvotes;
});

// ============================================
// Pre-save Middleware
// ============================================

// Update status history
feedbackSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: Date.now(),
    });

    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = Date.now();
      this.sla.resolutionTime = Math.floor((this.resolvedAt - this.createdAt) / (1000 * 60 * 60));
    }
  }
  next();
});

// Set priority based on type
feedbackSchema.pre('save', function (next) {
  if (this.isNew) {
    if (this.feedbackType === 'bug_report' && this.severity === 'critical') {
      this.priority = 'critical';
    } else if (this.feedbackType === 'complaint') {
      this.priority = 'high';
    }
  }
  next();
});

// Check SLA breach
feedbackSchema.pre('save', function (next) {
  if (this.ageInHours > this.sla.resolutionTarget && this.status !== 'resolved') {
    this.sla.isBreached = true;
  }
  next();
});

// ============================================
// Instance Methods
// ============================================

// Add response
feedbackSchema.methods.addResponse = async function (respondedBy, message, isInternal = false, attachments = []) {
  this.responses.push({ respondedBy, message, isInternal, attachments });
  this.lastResponseAt = Date.now();

  if (this.responses.length === 1 && !this.sla.firstResponseTime) {
    this.sla.firstResponseTime = Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60));
  }

  if (this.status === 'new') {
    this.status = 'acknowledged';
  }

  return await this.save();
};

// Assign to user
feedbackSchema.methods.assignTo = async function (userId) {
  this.assignedTo = userId;
  this.assignedAt = Date.now();
  if (this.status === 'new') {
    this.status = 'in_progress';
  }
  return await this.save();
};

// Resolve feedback
feedbackSchema.methods.resolve = async function (resolvedBy, resolution, resolutionType) {
  this.status = 'resolved';
  this.resolvedAt = Date.now();
  this.resolvedBy = resolvedBy;
  this.resolution = resolution;
  this.resolutionType = resolutionType;
  return await this.save();
};

// Vote on feedback
feedbackSchema.methods.vote = async function (userId, voteType) {
  const existingVote = this.voters.find((v) => v.user.toString() === userId.toString());

  if (existingVote) {
    if (existingVote.vote === voteType) {
      // Remove vote
      this.voters = this.voters.filter((v) => v.user.toString() !== userId.toString());
      if (voteType === 'up') this.upvotes -= 1;
      else this.downvotes -= 1;
    } else {
      // Change vote
      existingVote.vote = voteType;
      if (voteType === 'up') {
        this.upvotes += 1;
        this.downvotes -= 1;
      } else {
        this.downvotes += 1;
        this.upvotes -= 1;
      }
    }
  } else {
    this.voters.push({ user: userId, vote: voteType });
    if (voteType === 'up') this.upvotes += 1;
    else this.downvotes += 1;
  }

  return await this.save();
};

// Add internal note
feedbackSchema.methods.addInternalNote = async function (addedBy, note) {
  this.internalNotes.push({ addedBy, note });
  return await this.save();
};

// Mark as duplicate
feedbackSchema.methods.markAsDuplicate = async function (originalFeedbackId) {
  this.status = 'duplicate';
  this.duplicateOf = originalFeedbackId;
  return await this.save();
};

// Submit satisfaction rating
feedbackSchema.methods.submitSatisfaction = async function (isSatisfied, rating, comment) {
  this.satisfaction = { isSatisfied, rating, comment, submittedAt: Date.now() };
  return await this.save();
};

// ============================================
// Static Methods
// ============================================

// Get pending feedback
feedbackSchema.statics.getPending = function (limit = 20) {
  return this.find({
    status: { $in: ['new', 'acknowledged', 'in_progress'] },
  })
    .sort({ priority: -1, createdAt: 1 })
    .limit(limit)
    .populate('user', 'name email')
    .populate('assignedTo', 'name email');
};

// Get by priority
feedbackSchema.statics.getByPriority = function (priority, limit = 20) {
  return this.find({ priority })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email');
};

// Get overdue feedback
feedbackSchema.statics.getOverdue = function () {
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - 72);

  return this.find({
    createdAt: { $lte: cutoffDate },
    status: { $nin: ['resolved', 'closed'] },
  })
    .sort({ createdAt: 1 })
    .populate('user assignedTo', 'name email');
};

// Get testimonials for homepage
feedbackSchema.statics.getTestimonials = function (limit = 10) {
  return this.find({
    isTestimonial: true,
    isPublic: true,
    'rating.overall': { $gte: 4 },
  })
    .sort({ isFeatured: -1, 'rating.overall': -1 })
    .limit(limit)
    .populate('user', 'name profileImage');
};

// Get feedback statistics
feedbackSchema.statics.getStats = async function () {
  return await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$sla.firstResponseTime' },
        avgResolutionTime: { $avg: '$sla.resolutionTime' },
      },
    },
  ]);
};

// ============================================
// Export Model
// ============================================
const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;