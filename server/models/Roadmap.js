// ============================================
// EntreSkillHub - Roadmap Model
// ============================================

const mongoose = require('mongoose');
const slugify = require('slugify');

// ============================================
// Sub-schema for Roadmap Steps
// ============================================
const roadmapStepSchema = new mongoose.Schema(
  {
    stepNumber: { type: Number, required: [true, 'Step number is required'], min: 1 },
    title: {
      type: String,
      required: [true, 'Step title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Step description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    shortDescription: { type: String, trim: true, maxlength: 300, default: '' },
    phase: {
      type: String,
      enum: [
        'idea_validation', 'planning', 'skill_building', 'legal_setup',
        'financial_setup', 'infrastructure', 'branding', 'marketing',
        'launch', 'operations', 'growth', 'scaling',
      ],
      required: [true, 'Phase is required'],
      index: true,
    },
    category: {
      type: String,
      enum: [
        'research', 'documentation', 'financial', 'legal', 'operational',
        'marketing', 'skill_development', 'networking', 'technical',
      ],
      default: 'operational',
    },
    estimatedDuration: {
      value: { type: Number, min: 1, default: 3 },
      unit: { type: String, enum: ['hours', 'days', 'weeks', 'months'], default: 'days' },
    },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    estimatedCost: {
      amount: { type: Number, min: 0, default: 0 },
      currency: { type: String, default: 'INR' },
      breakdown: [{ item: String, cost: Number }],
      isOptional: { type: Boolean, default: false },
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    isOptional: { type: Boolean, default: false },
    dependencies: [{ type: Number }],
    tasks: [
      {
        taskId: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: '' },
        isCompleted: { type: Boolean, default: false },
        estimatedTime: String,
        order: { type: Number, default: 0 },
      },
    ],
    checklist: [
      {
        item: { type: String, required: true, trim: true },
        description: String,
        isRequired: { type: Boolean, default: true },
      },
    ],
    requiredDocuments: [
      {
        name: { type: String, required: true },
        description: String,
        template: String,
        isRequired: { type: Boolean, default: true },
      },
    ],
    tips: [
      {
        tip: { type: String, required: true },
        icon: { type: String, default: '💡' },
      },
    ],
    commonMistakes: [
      {
        mistake: String,
        howToAvoid: String,
      },
    ],
    resources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LearningResource' }],
    externalLinks: [
      {
        title: String,
        url: String,
        description: String,
        source: String,
      },
    ],
    image: {
      url: String,
      publicId: String,
      alt: String,
    },
    videoUrl: { type: String, default: '' },
    expectedOutcomes: [{ type: String, trim: true }],
    successCriteria: [
      {
        criterion: String,
        measurableGoal: String,
      },
    ],
    legalRequirements: [
      {
        requirement: String,
        authority: String,
        cost: Number,
        processTime: String,
      },
    ],
    toolsRequired: [
      {
        name: String,
        purpose: String,
        cost: { type: String, enum: ['free', 'paid', 'freemium'], default: 'free' },
        url: String,
      },
    ],
    faqs: [
      {
        question: String,
        answer: String,
      },
    ],
  },
  { _id: true, timestamps: false }
);

// ============================================
// Main Roadmap Schema
// ============================================
const roadmapSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Roadmap title is required'],
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
      minlength: [50, 'Description must be at least 50 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    shortDescription: { type: String, trim: true, maxlength: 300, default: '' },

    businessIdea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessIdea',
      required: [true, 'Business idea reference is required'],
      index: true,
    },
    relatedSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],

    category: {
      type: String,
      required: true,
      enum: [
        'Home-Based Business', 'Service Business', 'Product Business', 'Online Business',
        'Food Business', 'Retail Business', 'Creative Business', 'Technical Service',
        'Educational Service', 'Health & Wellness', 'Event Management', 'Consulting',
        'Freelancing', 'E-commerce', 'Social Enterprise',
      ],
      index: true,
    },
    tags: [{ type: String, trim: true, lowercase: true }],

    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: null },
      alt: String,
    },
    introVideo: { type: String, default: '' },

    steps: [roadmapStepSchema],
    totalSteps: { type: Number, default: 0 },

    phases: [
      {
        name: { type: String, required: true },
        description: String,
        stepNumbers: [Number],
        estimatedDuration: String,
        color: { type: String, default: '#3B82F6' },
        icon: { type: String, default: '🎯' },
      },
    ],

    difficulty: {
      type: String,
      enum: ['very_easy', 'easy', 'medium', 'hard', 'very_hard'],
      default: 'medium',
      index: true,
    },
    estimatedDuration: {
      total: { type: Number, min: 1, default: 30 },
      unit: { type: String, enum: ['days', 'weeks', 'months'], default: 'days' },
      breakdown: {
        planning: Number,
        setup: Number,
        launch: Number,
        stabilization: Number,
      },
    },

    totalInvestment: {
      minimum: { type: Number, min: 0, default: 0 },
      maximum: { type: Number, min: 0, default: 0 },
      currency: { type: String, default: 'INR' },
      breakdown: [
        {
          phase: String,
          amount: Number,
        },
      ],
    },

    prerequisites: {
      skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
      education: [String],
      experience: [String],
      financial: {
        minimumSaving: Number,
        creditScore: String,
      },
      documents: [
        {
          name: String,
          description: String,
          isMandatory: Boolean,
        },
      ],
      tools: [String],
      certifications: [String],
    },

    learningObjectives: [
      {
        objective: { type: String, required: true },
        description: String,
      },
    ],
    expectedOutcomes: [{ type: String, trim: true }],
    milestones: [
      {
        title: { type: String, required: true },
        description: String,
        atStep: Number,
        badge: {
          name: String,
          icon: String,
          color: String,
        },
      },
    ],

    successMetrics: [
      {
        metric: String,
        target: String,
        timeframe: String,
        description: String,
      },
    ],
    kpis: [
      {
        name: String,
        description: String,
        formula: String,
        targetValue: String,
      },
    ],

    recommendedMentors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' }],
    supportChannels: [
      {
        type: {
          type: String,
          enum: ['forum', 'chat', 'email', 'video_call', 'in_person'],
        },
        description: String,
        availability: String,
      },
    ],

    stats: {
      enrolledCount: { type: Number, default: 0 },
      activeUsers: { type: Number, default: 0 },
      completedCount: { type: Number, default: 0 },
      completionRate: { type: Number, min: 0, max: 100, default: 0 },
      averageCompletionTime: { type: Number, default: 0 },
      viewCount: { type: Number, default: 0 },
      bookmarkCount: { type: Number, default: 0 },
      shareCount: { type: Number, default: 0 },
    },

    rating: {
      average: { type: Number, min: 0, max: 5, default: 0 },
      total: { type: Number, default: 0 },
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
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        completedAt: Date,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        category: String,
        order: { type: Number, default: 0 },
      },
    ],

    status: {
      type: String,
      enum: ['draft', 'pending_review', 'approved', 'rejected', 'archived'],
      default: 'approved',
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isPremium: { type: Boolean, default: false },

    version: { type: String, default: '1.0.0' },
    versionHistory: [
      {
        version: String,
        changes: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    lastReviewedAt: { type: Date, default: Date.now },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contributors: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: String,
        contribution: String,
      },
    ],
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },

    seo: {
      metaTitle: { type: String, maxlength: 60 },
      metaDescription: { type: String, maxlength: 160 },
      keywords: [String],
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
roadmapSchema.index({ title: 'text', description: 'text', tags: 'text' });
roadmapSchema.index({ category: 1, difficulty: 1 });
roadmapSchema.index({ 'stats.enrolledCount': -1 });
roadmapSchema.index({ 'rating.average': -1 });
roadmapSchema.index({ createdAt: -1 });

// ============================================
// Virtual Fields - ALL SAFE VERSIONS
// ============================================

// Total tasks across all steps - SAFE
roadmapSchema.virtual('totalTasks').get(function () {
  try {
    if (!this.steps || !Array.isArray(this.steps)) return 0;
    return this.steps.reduce((total, step) => total + ((step.tasks && step.tasks.length) || 0), 0);
  } catch (error) {
    return 0;
  }
});

// Total estimated cost - SAFE
roadmapSchema.virtual('totalEstimatedCost').get(function () {
  try {
    if (!this.steps || !Array.isArray(this.steps)) return 0;
    return this.steps.reduce((total, step) => total + ((step.estimatedCost && step.estimatedCost.amount) || 0), 0);
  } catch (error) {
    return 0;
  }
});

// Average step difficulty - SAFE
roadmapSchema.virtual('averageDifficulty').get(function () {
  try {
    if (!this.steps || !Array.isArray(this.steps) || this.steps.length === 0) return 'medium';
    const difficultyMap = { easy: 1, medium: 2, hard: 3 };
    const total = this.steps.reduce((sum, step) => sum + (difficultyMap[step.difficulty] || 2), 0);
    const avg = total / this.steps.length;
    if (avg < 1.5) return 'easy';
    if (avg < 2.5) return 'medium';
    return 'hard';
  } catch (error) {
    return 'medium';
  }
});

// URL - SAFE
roadmapSchema.virtual('url').get(function () {
  return `/roadmaps/${this.slug || this._id}`;
});

// ============================================
// Pre-save Middleware
// ============================================

// Generate slug
roadmapSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true, trim: true });
  }
  next();
});

// Update total steps count
roadmapSchema.pre('save', function (next) {
  this.totalSteps = (this.steps && this.steps.length) || 0;
  next();
});

// Sort steps by step number
roadmapSchema.pre('save', function (next) {
  try {
    if (this.isModified('steps') && this.steps && Array.isArray(this.steps)) {
      this.steps.sort((a, b) => a.stepNumber - b.stepNumber);
    }
  } catch (e) {
    // Ignore
  }
  next();
});

// Auto SEO
roadmapSchema.pre('save', function (next) {
  if (!this.seo) this.seo = {};
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = `${this.title} - Business Roadmap | EntreSkillHub`.substring(0, 60);
  }
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = this.shortDescription || (this.description || '').substring(0, 160);
  }
  next();
});

// ============================================
// Instance Methods
// ============================================

roadmapSchema.methods.incrementViews = async function () {
  this.stats.viewCount = (this.stats.viewCount || 0) + 1;
  return await this.save({ validateBeforeSave: false });
};

roadmapSchema.methods.enrollUser = async function () {
  this.stats.enrolledCount = (this.stats.enrolledCount || 0) + 1;
  this.stats.activeUsers = (this.stats.activeUsers || 0) + 1;
  return await this.save({ validateBeforeSave: false });
};

roadmapSchema.methods.markCompletion = async function () {
  this.stats.completedCount = (this.stats.completedCount || 0) + 1;
  this.stats.activeUsers = Math.max(0, (this.stats.activeUsers || 0) - 1);
  if (this.stats.enrolledCount > 0) {
    this.stats.completionRate = Math.round((this.stats.completedCount / this.stats.enrolledCount) * 100);
  }
  return await this.save({ validateBeforeSave: false });
};

roadmapSchema.methods.addRating = async function (userId, rating, comment) {
  const currentTotal = (this.rating.average || 0) * (this.rating.total || 0);
  this.rating.total = (this.rating.total || 0) + 1;
  this.rating.average = (currentTotal + rating) / this.rating.total;

  const stars = ['one', 'two', 'three', 'four', 'five'];
  this.rating.distribution[stars[rating - 1]] = (this.rating.distribution[stars[rating - 1]] || 0) + 1;

  this.reviews.push({ user: userId, rating, comment, completedAt: Date.now() });
  return await this.save({ validateBeforeSave: false });
};

roadmapSchema.methods.getStep = function (stepNumber) {
  if (!this.steps || !Array.isArray(this.steps)) return null;
  return this.steps.find((step) => step.stepNumber === stepNumber);
};

roadmapSchema.methods.getNextStep = function (currentStepNumber) {
  if (!this.steps || !Array.isArray(this.steps)) return null;
  return this.steps.find((step) => step.stepNumber === currentStepNumber + 1);
};

roadmapSchema.methods.getPreviousStep = function (currentStepNumber) {
  if (!this.steps || !Array.isArray(this.steps)) return null;
  return this.steps.find((step) => step.stepNumber === currentStepNumber - 1);
};

roadmapSchema.methods.calculateProgress = function (completedSteps) {
  if (!this.totalSteps || this.totalSteps === 0) return 0;
  return Math.round((completedSteps.length / this.totalSteps) * 100);
};

// ============================================
// Static Methods
// ============================================

roadmapSchema.statics.getByBusinessIdea = function (businessIdeaId) {
  return this.find({
    businessIdea: businessIdeaId,
    isActive: true,
    status: 'approved',
  }).populate('businessIdea');
};

roadmapSchema.statics.getFeatured = function (limit = 10) {
  return this.find({ isFeatured: true, isActive: true, status: 'approved' })
    .sort({ 'rating.average': -1 })
    .limit(limit)
    .populate('businessIdea');
};

roadmapSchema.statics.getPopular = function (limit = 10) {
  return this.find({ isActive: true, status: 'approved' })
    .sort({ 'stats.enrolledCount': -1 })
    .limit(limit);
};

roadmapSchema.statics.getByCategory = function (category, limit = 20) {
  return this.find({ category, isActive: true, status: 'approved' })
    .sort({ 'stats.enrolledCount': -1 })
    .limit(limit);
};

// ============================================
// Export Model
// ============================================
const Roadmap = mongoose.model('Roadmap', roadmapSchema);

module.exports = Roadmap;