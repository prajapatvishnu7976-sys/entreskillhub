// ============================================
// EntreSkillHub - Skill Model
// ============================================

const mongoose = require('mongoose');
const slugify = require('slugify');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Skill name must be at least 2 characters'],
      maxlength: [100, 'Skill name cannot exceed 100 characters'],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Skill description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [200, 'Short description cannot exceed 200 characters'],
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Skill category is required'],
      enum: [
        'Tailoring & Fashion', 'Handicrafts & Artisan', 'Food & Catering',
        'Beauty & Wellness', 'Repair & Maintenance', 'Digital & IT Skills',
        'Photography & Videography', 'Tutoring & Education', 'Gardening & Agriculture',
        'Fitness & Sports', 'Music & Entertainment', 'Writing & Content',
        'Translation & Languages', 'Driving & Logistics', 'Cleaning & Housekeeping',
        'Pet Care & Grooming', 'Carpentry & Woodwork', 'Electrical & Plumbing',
        'Painting & Decoration', 'Other',
      ],
      index: true,
    },
    subCategory: { type: String, trim: true, default: '', index: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    icon: { type: String, default: '🎯', trim: true },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: null },
      alt: { type: String, default: '' },
    },
    color: { type: String, default: '#3B82F6' },
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
      index: true,
    },
    learningTime: {
      duration: { type: Number, min: 1, max: 520, default: 4 },
      unit: { type: String, enum: ['days', 'weeks', 'months', 'years'], default: 'weeks' },
      description: { type: String, default: '' },
    },
    prerequisites: [{ type: String, trim: true }],
    requiredTools: [
      {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: '' },
        estimatedCost: { type: Number, min: 0, default: 0 },
        isEssential: { type: Boolean, default: true },
      },
    ],
    requiredMaterials: [
      {
        name: { type: String, required: true, trim: true },
        quantity: String,
        estimatedCost: { type: Number, min: 0, default: 0 },
      },
    ],
    businessPotential: {
      score: { type: Number, min: 1, max: 10, default: 5 },
      demand: {
        type: String,
        enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
        default: 'medium',
      },
      marketSize: {
        type: String,
        enum: ['local', 'regional', 'national', 'international'],
        default: 'local',
      },
      seasonality: {
        type: String,
        enum: ['year_round', 'seasonal', 'occasional'],
        default: 'year_round',
      },
    },
    earningPotential: {
      monthly: {
        min: { type: Number, min: 0, default: 5000 },
        max: { type: Number, min: 0, default: 50000 },
      },
      currency: { type: String, default: 'INR' },
      note: { type: String, default: '' },
    },
    relatedBusinessIdeas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BusinessIdea' }],
    relatedSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    learningResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LearningResource' }],
    learningPath: [
      {
        step: { type: Number, required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        duration: String,
        resources: [String],
      },
    ],
    popularity: { type: Number, default: 0, index: true },
    userCount: { type: Number, default: 0 },
    completionRate: { type: Number, min: 0, max: 100, default: 0 },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    totalRatings: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    translations: [
      {
        language: { type: String, enum: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa'] },
        name: String,
        description: String,
        shortDescription: String,
      },
    ],
    targetAudience: [
      {
        type: String,
        enum: [
          'youth', 'women', 'rural', 'urban', 'seniors', 'students',
          'housewives', 'unemployed', 'part_time_seekers', 'all',
        ],
      },
    ],
    genderPreference: {
      type: String,
      enum: ['any', 'male', 'female'],
      default: 'any',
    },
    ageRange: {
      min: { type: Number, min: 13, default: 18 },
      max: { type: Number, max: 100, default: 65 },
    },
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'approved', 'rejected', 'archived'],
      default: 'approved',
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isTrending: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    seo: {
      metaTitle: { type: String, maxlength: 60, default: '' },
      metaDescription: { type: String, maxlength: 160, default: '' },
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
skillSchema.index({ name: 'text', description: 'text', tags: 'text' });
skillSchema.index({ category: 1, difficultyLevel: 1 });
skillSchema.index({ popularity: -1, isActive: 1 });
skillSchema.index({ 'businessPotential.score': -1 });
skillSchema.index({ createdAt: -1 });

// ============================================
// Virtual Fields - SAFE versions
// ============================================
skillSchema.virtual('totalStartupCost').get(function () {
  try {
    const toolsCost = (this.requiredTools || []).reduce((sum, tool) => sum + (tool.estimatedCost || 0), 0);
    const materialsCost = (this.requiredMaterials || []).reduce((sum, mat) => sum + (mat.estimatedCost || 0), 0);
    return toolsCost + materialsCost;
  } catch (error) {
    return 0;
  }
});

skillSchema.virtual('averageEarning').get(function () {
  try {
    const min = this.earningPotential?.monthly?.min || 0;
    const max = this.earningPotential?.monthly?.max || 0;
    return Math.round((min + max) / 2);
  } catch (error) {
    return 0;
  }
});

skillSchema.virtual('url').get(function () {
  return `/skills/${this.slug || this._id}`;
});

// ============================================
// Pre-save Middleware
// ============================================
skillSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true, trim: true });
  }
  next();
});

skillSchema.pre('save', function (next) {
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = `${this.name} - Learn & Start Business | EntreSkillHub`.substring(0, 60);
  }
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = this.shortDescription || (this.description || '').substring(0, 160);
  }
  next();
});

// ============================================
// Instance Methods
// ============================================
skillSchema.methods.incrementViews = async function () {
  this.viewCount = (this.viewCount || 0) + 1;
  return await this.save({ validateBeforeSave: false });
};

skillSchema.methods.updateRating = async function (newRating) {
  const currentTotal = (this.averageRating || 0) * (this.totalRatings || 0);
  this.totalRatings = (this.totalRatings || 0) + 1;
  this.averageRating = (currentTotal + newRating) / this.totalRatings;
  return await this.save({ validateBeforeSave: false });
};

skillSchema.methods.addUser = async function () {
  this.userCount = (this.userCount || 0) + 1;
  this.popularity = (this.popularity || 0) + 1;
  return await this.save({ validateBeforeSave: false });
};

skillSchema.methods.getTranslation = function (language = 'en') {
  if (language === 'en') {
    return {
      name: this.name,
      description: this.description,
      shortDescription: this.shortDescription,
    };
  }
  const translation = (this.translations || []).find((t) => t.language === language);
  return translation || {
    name: this.name,
    description: this.description,
    shortDescription: this.shortDescription,
  };
};

// ============================================
// Static Methods
// ============================================
skillSchema.statics.getFeaturedSkills = function (limit = 10) {
  return this.find({ isFeatured: true, isActive: true, status: 'approved' })
    .sort({ popularity: -1 })
    .limit(limit);
};

skillSchema.statics.getTrendingSkills = function (limit = 10) {
  return this.find({ isTrending: true, isActive: true, status: 'approved' })
    .sort({ viewCount: -1 })
    .limit(limit);
};

skillSchema.statics.getByCategory = function (category, limit = 20) {
  return this.find({ category, isActive: true, status: 'approved' })
    .sort({ popularity: -1 })
    .limit(limit);
};

skillSchema.statics.searchSkills = function (query, filters = {}) {
  return this.find({
    $and: [
      { isActive: true, status: 'approved' },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
        ],
      },
      filters,
    ],
  });
};

skillSchema.statics.getSkillStats = async function () {
  return await this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgPopularity: { $avg: '$popularity' },
        avgRating: { $avg: '$averageRating' },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// ============================================
// Export Model
// ============================================
const Skill = mongoose.model('Skill', skillSchema);

module.exports = Skill;