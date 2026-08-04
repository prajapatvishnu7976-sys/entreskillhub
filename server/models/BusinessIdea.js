// ============================================
// EntreSkillHub - Business Idea Model
// ============================================

const mongoose = require('mongoose');
const slugify = require('slugify');

const businessIdeaSchema = new mongoose.Schema(
  {
    // Basic Info
    title: {
      type: String,
      required: [true, 'Business idea title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: [200, 'Tagline cannot exceed 200 characters'],
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [50, 'Description must be at least 50 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
      default: '',
    },

    // Categorization
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Home-Based Business', 'Service Business', 'Product Business', 'Online Business',
        'Food Business', 'Retail Business', 'Creative Business', 'Technical Service',
        'Educational Service', 'Health & Wellness', 'Event Management', 'Consulting',
        'Freelancing', 'E-commerce', 'Social Enterprise',
      ],
      index: true,
    },
    subCategory: { type: String, trim: true, default: '' },
    industry: { type: String, trim: true, default: '', index: true },
    tags: [{ type: String, trim: true, lowercase: true }],

    // Media
    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: null },
      alt: { type: String, default: '' },
    },
    gallery: [
      {
        url: String,
        publicId: String,
        caption: String,
      },
    ],
    videoUrl: { type: String, default: '' },
    icon: { type: String, default: '💼' },

    // Required Skills
    requiredSkills: [
      {
        skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
        importance: {
          type: String,
          enum: ['essential', 'important', 'good_to_have'],
          default: 'important',
        },
        minimumLevel: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced'],
          default: 'beginner',
        },
      },
    ],
    requiredInterests: [{ type: String, trim: true }],

    // Investment
    investment: {
      minimum: { type: Number, required: [true, 'Minimum investment is required'], min: 0 },
      maximum: { type: Number, required: [true, 'Maximum investment is required'], min: 0 },
      currency: { type: String, default: 'INR' },
      breakdown: [
        {
          item: { type: String, required: true, trim: true },
          cost: { type: Number, required: true, min: 0 },
          isOneTime: { type: Boolean, default: true },
          description: String,
        },
      ],
    },

    // Revenue
    revenue: {
      monthly: {
        min: { type: Number, min: 0, default: 0 },
        max: { type: Number, min: 0, default: 0 },
        realistic: { type: Number, min: 0, default: 0 },
      },
      profitMargin: { type: Number, min: 0, max: 100, default: 30 },
      breakEvenTime: {
        months: { type: Number, min: 0, default: 6 },
        description: String,
      },
      revenueStreams: [
        {
          source: String,
          description: String,
          percentage: Number,
        },
      ],
    },

    // Difficulty
    difficulty: {
      type: String,
      enum: ['very_easy', 'easy', 'medium', 'hard', 'very_hard'],
      default: 'medium',
      index: true,
    },
    complexity: {
      technical: { type: String, enum: ['none', 'low', 'medium', 'high'], default: 'low' },
      operational: { type: String, enum: ['simple', 'moderate', 'complex'], default: 'moderate' },
      legal: { type: String, enum: ['minimal', 'moderate', 'extensive'], default: 'minimal' },
    },
    timeToStart: {
      duration: { type: Number, min: 1, default: 30 },
      unit: { type: String, enum: ['days', 'weeks', 'months'], default: 'days' },
    },
    timeCommitment: {
      hoursPerDay: {
        min: { type: Number, min: 1, max: 24, default: 4 },
        max: { type: Number, min: 1, max: 24, default: 8 },
      },
      canBePartTime: { type: Boolean, default: true },
      flexibleHours: { type: Boolean, default: true },
    },

    // Target Market
    targetMarket: {
      primaryAudience: { type: String, trim: true, default: '' },
      demographics: {
        ageRange: {
          min: { type: Number, default: 18 },
          max: { type: Number, default: 65 },
        },
        gender: { type: String, enum: ['any', 'male', 'female'], default: 'any' },
        income: {
          type: String,
          enum: ['low', 'middle', 'upper_middle', 'high', 'any'],
          default: 'any',
        },
      },
      geography: {
        type: String,
        enum: ['hyperlocal', 'local', 'city', 'state', 'national', 'international'],
        default: 'local',
      },
      marketSize: {
        type: String,
        enum: ['small', 'medium', 'large', 'very_large'],
        default: 'medium',
      },
    },
    customerAcquisition: {
      channels: [String],
      strategies: [String],
      estimatedCAC: { type: Number, min: 0, default: 0 },
    },

    // Legal
    legalRequirements: {
      registration: [
        {
          type: {
            type: String,
            enum: [
              'gst', 'udyam', 'msme', 'shop_act', 'fssai', 'trade_license',
              'company_registration', 'gumasta', 'iso_certification', 'other',
            ],
          },
          description: String,
          isRequired: { type: Boolean, default: true },
          estimatedCost: { type: Number, min: 0, default: 0 },
          processTime: String,
          documents: [String],
        },
      ],
      permits: [
        {
          name: String,
          issuingAuthority: String,
          cost: Number,
          validity: String,
        },
      ],
      insurance: [
        {
          type: String,
          description: String,
          recommended: Boolean,
        },
      ],
      taxes: [
        {
          name: String,
          rate: String,
          description: String,
        },
      ],
    },

    // Location
    locationRequirement: {
      type: {
        type: String,
        enum: [
          'home_based', 'small_shop', 'office_space', 'warehouse',
          'online_only', 'mobile', 'field_work',
        ],
        default: 'home_based',
      },
      minimumSpace: {
        area: Number,
        unit: { type: String, enum: ['sqft', 'sqm'], default: 'sqft' },
      },
      idealLocation: [String],
      rentEstimate: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
      },
    },

    // Equipment
    equipment: [
      {
        name: { type: String, required: true, trim: true },
        description: String,
        cost: { type: Number, min: 0, default: 0 },
        isEssential: { type: Boolean, default: true },
        alternatives: [String],
        vendors: [String],
      },
    ],
    materials: [
      {
        name: String,
        description: String,
        estimatedMonthlyCost: { type: Number, min: 0, default: 0 },
        suppliers: [String],
      },
    ],

    // Marketing
    marketingStrategy: {
      channels: [
        {
          name: String,
          description: String,
          cost: { type: String, enum: ['free', 'low', 'medium', 'high'] },
          effectiveness: { type: String, enum: ['low', 'medium', 'high', 'very_high'] },
        },
      ],
      brandingTips: [String],
      pricingStrategy: {
        type: String,
        enum: ['low_cost', 'value_based', 'premium', 'competitive'],
        default: 'competitive',
      },
      promotionalIdeas: [String],
    },

    // Success Factors
    successFactors: [
      {
        factor: { type: String, required: true },
        description: String,
        importance: {
          type: String,
          enum: ['critical', 'high', 'medium', 'low'],
          default: 'medium',
        },
      },
    ],
    challenges: [
      {
        challenge: { type: String, required: true },
        description: String,
        solution: String,
        severity: {
          type: String,
          enum: ['minor', 'moderate', 'major', 'critical'],
          default: 'moderate',
        },
      },
    ],
    risks: [
      {
        risk: String,
        impact: { type: String, enum: ['low', 'medium', 'high'] },
        probability: { type: String, enum: ['low', 'medium', 'high'] },
        mitigation: String,
      },
    ],

    // Scalability
    scalability: {
      potential: {
        type: String,
        enum: ['limited', 'moderate', 'high', 'very_high'],
        default: 'moderate',
      },
      scalingOptions: [String],
      expansionIdeas: [String],
      franchiseOpportunity: { type: Boolean, default: false },
    },

    // Related Content
    roadmap: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', default: null },
    learningResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LearningResource' }],
    recommendedMentors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' }],
    similarIdeas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BusinessIdea' }],

    // Success Stories
    successStories: [
      {
        entrepreneur: String,
        location: String,
        description: String,
        yearStarted: Number,
        currentStatus: String,
        image: String,
      },
    ],

    // Stats
    stats: {
      viewCount: { type: Number, default: 0 },
      bookmarkCount: { type: Number, default: 0 },
      startedCount: { type: Number, default: 0 },
      completedCount: { type: Number, default: 0 },
      shareCount: { type: Number, default: 0 },
    },

    // Rating
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

    // Status
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'approved', 'rejected', 'archived'],
      default: 'approved',
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isTrending: { type: Boolean, default: false },
    isBeginnerFriendly: { type: Boolean, default: false, index: true },
    isLowInvestment: { type: Boolean, default: false, index: true },
    isHighDemand: { type: Boolean, default: false },

    // Recommendation
    recommendationScore: { type: Number, default: 0 },
    matchingCriteria: [
      {
        criterion: String,
        weight: Number,
      },
    ],

    // Creation & Modification
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },

    // SEO
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
businessIdeaSchema.index({ title: 'text', description: 'text', tags: 'text' });
businessIdeaSchema.index({ category: 1, difficulty: 1 });
businessIdeaSchema.index({ 'investment.minimum': 1, 'investment.maximum': 1 });
businessIdeaSchema.index({ 'stats.viewCount': -1 });
businessIdeaSchema.index({ 'rating.average': -1 });
businessIdeaSchema.index({ recommendationScore: -1 });
businessIdeaSchema.index({ createdAt: -1 });

// ============================================
// Virtual Fields - ALL SAFE VERSIONS
// ============================================

// Average investment - SAFE
businessIdeaSchema.virtual('averageInvestment').get(function () {
  try {
    const min = this.investment?.minimum || 0;
    const max = this.investment?.maximum || 0;
    return Math.round((min + max) / 2);
  } catch (error) {
    return 0;
  }
});

// ROI estimate - SAFE
businessIdeaSchema.virtual('estimatedROI').get(function () {
  try {
    const avgInvestment = this.averageInvestment;
    if (!avgInvestment || avgInvestment === 0) return 0;
    const realistic = this.revenue?.monthly?.realistic || 0;
    const profitMargin = this.revenue?.profitMargin || 30;
    const monthlyProfit = realistic * (profitMargin / 100);
    const annualProfit = monthlyProfit * 12;
    return Math.round((annualProfit / avgInvestment) * 100);
  } catch (error) {
    return 0;
  }
});

// Total setup cost - SAFE
businessIdeaSchema.virtual('totalSetupCost').get(function () {
  try {
    if (!this.investment || !this.investment.breakdown) return 0;
    return this.investment.breakdown.reduce((sum, item) => sum + (item.cost || 0), 0);
  } catch (error) {
    return 0;
  }
});

// URL - SAFE
businessIdeaSchema.virtual('url').get(function () {
  return `/business-ideas/${this.slug || this._id}`;
});

// ============================================
// Pre-save Middleware
// ============================================

// Generate slug
businessIdeaSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true, trim: true });
  }
  next();
});

// Set flags based on investment
businessIdeaSchema.pre('save', function (next) {
  try {
    if (this.investment?.maximum && this.investment.maximum <= 25000) {
      this.isLowInvestment = true;
    }
    if (this.difficulty === 'very_easy' || this.difficulty === 'easy') {
      this.isBeginnerFriendly = true;
    }
  } catch (e) {
    // Ignore
  }
  next();
});

// SEO defaults
businessIdeaSchema.pre('save', function (next) {
  if (!this.seo) this.seo = {};
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = `${this.title} - Business Idea | EntreSkillHub`.substring(0, 60);
  }
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = this.shortDescription || (this.description || '').substring(0, 160);
  }
  next();
});

// ============================================
// Instance Methods
// ============================================

// Increment views
businessIdeaSchema.methods.incrementViews = async function () {
  this.stats.viewCount = (this.stats.viewCount || 0) + 1;
  return await this.save({ validateBeforeSave: false });
};

// Update rating
businessIdeaSchema.methods.addRating = async function (rating) {
  const currentTotal = (this.rating.average || 0) * (this.rating.total || 0);
  this.rating.total = (this.rating.total || 0) + 1;
  this.rating.average = (currentTotal + rating) / this.rating.total;

  const stars = ['one', 'two', 'three', 'four', 'five'];
  this.rating.distribution[stars[rating - 1]] = (this.rating.distribution[stars[rating - 1]] || 0) + 1;

  return await this.save({ validateBeforeSave: false });
};

// Calculate match score for a user
businessIdeaSchema.methods.calculateMatchScore = function (userSkills, userInterests) {
  try {
    let score = 0;
    const skillWeight = 0.6;
    const interestWeight = 0.4;

    const userSkillIds = (userSkills || []).map((s) => s.skill?.toString() || s.toString());
    const requiredSkillIds = (this.requiredSkills || []).map((rs) => rs.skill?.toString() || rs.skill);
    const matchedSkills = requiredSkillIds.filter((id) => userSkillIds.includes(id));

    if (requiredSkillIds.length > 0) {
      score += (matchedSkills.length / requiredSkillIds.length) * skillWeight * 100;
    }

    if (this.requiredInterests && this.requiredInterests.length > 0 && userInterests && userInterests.length > 0) {
      const matchedInterests = this.requiredInterests.filter((i) =>
        userInterests.some((ui) => ui.toLowerCase().includes(i.toLowerCase()))
      );
      score += (matchedInterests.length / this.requiredInterests.length) * interestWeight * 100;
    }

    return Math.round(score);
  } catch (error) {
    return 0;
  }
};

// ============================================
// Static Methods
// ============================================

// Get recommendations for user
businessIdeaSchema.statics.getRecommendations = async function (userSkills, userInterests, limit = 10) {
  try {
    const ideas = await this.find({
      isActive: true,
      status: 'approved',
    }).populate('requiredSkills.skill');

    const scoredIdeas = ideas
      .map((idea) => ({
        idea,
        score: idea.calculateMatchScore(userSkills, userInterests),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scoredIdeas;
  } catch (error) {
    console.error('Recommendations error:', error);
    return [];
  }
};

// Get by investment range
businessIdeaSchema.statics.getByInvestmentRange = function (min, max, limit = 20) {
  return this.find({
    'investment.minimum': { $gte: min },
    'investment.maximum': { $lte: max },
    isActive: true,
    status: 'approved',
  })
    .sort({ 'stats.viewCount': -1 })
    .limit(limit);
};

// Get trending
businessIdeaSchema.statics.getTrending = function (limit = 10) {
  return this.find({ isTrending: true, isActive: true, status: 'approved' })
    .sort({ 'stats.viewCount': -1 })
    .limit(limit);
};

// Get featured
businessIdeaSchema.statics.getFeatured = function (limit = 10) {
  return this.find({ isFeatured: true, isActive: true, status: 'approved' })
    .sort({ 'rating.average': -1 })
    .limit(limit);
};

// ============================================
// Export Model
// ============================================
const BusinessIdea = mongoose.model('BusinessIdea', businessIdeaSchema);

module.exports = BusinessIdea;