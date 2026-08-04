// ============================================
// EntreSkillHub - Mentor Model
// Comprehensive mentor profile and details
// ============================================

const mongoose = require('mongoose');
const slugify = require('slugify');

const mentorSchema = new mongoose.Schema(
  {
    // ============================================
    // User Reference
    // ============================================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    // ============================================
    // Professional Information
    // ============================================
    title: {
      type: String,
      required: [true, 'Professional title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },

    tagline: {
      type: String,
      trim: true,
      maxlength: [200, 'Tagline cannot exceed 200 characters'],
      default: '',
    },

    professionalBio: {
      type: String,
      required: [true, 'Professional bio is required'],
      trim: true,
      minlength: [50, 'Bio must be at least 50 characters'],
      maxlength: [3000, 'Bio cannot exceed 3000 characters'],
    },

    shortBio: {
      type: String,
      trim: true,
      maxlength: [300, 'Short bio cannot exceed 300 characters'],
      default: '',
    },

    // ============================================
    // Expertise
    // ============================================
    expertise: [
      {
        area: {
          type: String,
          required: true,
          trim: true,
        },
        yearsOfExperience: {
          type: Number,
          min: 0,
          max: 50,
          default: 0,
        },
        proficiencyLevel: {
          type: String,
          enum: ['intermediate', 'advanced', 'expert'],
          default: 'advanced',
        },
      },
    ],

    expertiseCategories: [
      {
        type: String,
        enum: [
          'Tailoring & Fashion',
          'Handicrafts & Artisan',
          'Food & Catering',
          'Beauty & Wellness',
          'Repair & Maintenance',
          'Digital & IT Skills',
          'Photography & Videography',
          'Tutoring & Education',
          'Gardening & Agriculture',
          'Fitness & Sports',
          'Music & Entertainment',
          'Writing & Content',
          'Translation & Languages',
          'Business Strategy',
          'Marketing',
          'Finance',
          'Legal',
          'Operations',
          'Other',
        ],
      },
    ],

    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],

    industries: [
      {
        type: String,
        trim: true,
      },
    ],

    specializations: [
      {
        type: String,
        trim: true,
      },
    ],

    // ============================================
    // Experience
    // ============================================
    totalExperience: {
      type: Number,
      min: 0,
      max: 60,
      required: [true, 'Total experience is required'],
      default: 0,
    },

    workExperience: [
      {
        company: {
          type: String,
          required: true,
          trim: true,
        },
        position: {
          type: String,
          required: true,
          trim: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          default: null,
        },
        isCurrent: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
          trim: true,
        },
        achievements: [String],
      },
    ],

    entrepreneurialExperience: [
      {
        businessName: String,
        role: String,
        industry: String,
        startYear: Number,
        endYear: Number,
        isRunning: Boolean,
        description: String,
        keyAchievements: [String],
      },
    ],

    // ============================================
    // Education
    // ============================================
    education: [
      {
        degree: {
          type: String,
          required: true,
          trim: true,
        },
        field: {
          type: String,
          trim: true,
        },
        institution: {
          type: String,
          required: true,
          trim: true,
        },
        yearOfCompletion: {
          type: Number,
          min: 1950,
          max: new Date().getFullYear() + 10,
        },
        grade: String,
      },
    ],

    // ============================================
    // Certifications
    // ============================================
    certifications: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        issuingOrganization: {
          type: String,
          required: true,
          trim: true,
        },
        issueDate: Date,
        expiryDate: Date,
        credentialId: String,
        credentialUrl: String,
        verified: {
          type: Boolean,
          default: false,
        },
      },
    ],

    awards: [
      {
        name: String,
        issuer: String,
        year: Number,
        description: String,
      },
    ],

    publications: [
      {
        title: String,
        publisher: String,
        year: Number,
        url: String,
        description: String,
      },
    ],

    // ============================================
    // Mentorship Preferences
    // ============================================
    mentorshipTypes: [
      {
        type: String,
        enum: [
          'one_on_one',
          'group_session',
          'workshop',
          'q_and_a',
          'code_review',
          'business_review',
          'strategy_session',
          'ongoing_mentorship',
        ],
      },
    ],

    mentorshipMode: [
      {
        type: String,
        enum: ['online', 'in_person', 'hybrid'],
      },
    ],

    mentorshipStyle: {
      type: String,
      enum: ['coaching', 'consulting', 'teaching', 'advising', 'mixed'],
      default: 'mixed',
    },

    preferredMenteeLevel: [
      {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'all_levels'],
      },
    ],

    // ============================================
    // Availability
    // ============================================
    availability: {
      isAvailable: {
        type: Boolean,
        default: true,
      },
      workingDays: [
        {
          day: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          },
          slots: [
            {
              startTime: String, // "09:00"
              endTime: String, // "17:00"
            },
          ],
        },
      ],
      timezone: {
        type: String,
        default: 'Asia/Kolkata',
      },
      responseTime: {
        type: String,
        enum: ['within_hour', 'within_day', 'within_2_days', 'within_week'],
        default: 'within_day',
      },
      maxSessionsPerWeek: {
        type: Number,
        min: 1,
        max: 50,
        default: 10,
      },
      currentLoad: {
        type: Number,
        default: 0,
      },
      vacationMode: {
        isOn: {
          type: Boolean,
          default: false,
        },
        startDate: Date,
        endDate: Date,
        message: String,
      },
    },

    // ============================================
    // Pricing
    // ============================================
    pricing: {
      isFree: {
        type: Boolean,
        default: false,
      },
      sessionRates: [
        {
          duration: {
            type: Number, // in minutes
            required: true,
          },
          price: {
            type: Number,
            min: 0,
            required: true,
          },
          type: {
            type: String,
            enum: ['individual', 'group', 'workshop'],
          },
          description: String,
        },
      ],
      packages: [
        {
          name: String,
          description: String,
          sessions: Number,
          totalHours: Number,
          price: Number,
          discountPercent: Number,
          validityDays: Number,
        },
      ],
      currency: {
        type: String,
        default: 'INR',
      },
      firstSessionFree: {
        type: Boolean,
        default: false,
      },
      trialSessionDuration: {
        type: Number, // in minutes
        default: 15,
      },
    },

    // ============================================
    // Languages
    // ============================================
    languages: [
      {
        language: {
          type: String,
          required: true,
        },
        proficiency: {
          type: String,
          enum: ['basic', 'conversational', 'fluent', 'native'],
          default: 'fluent',
        },
      },
    ],

    // ============================================
    // Location
    // ============================================
    location: {
      country: {
        type: String,
        default: 'India',
      },
      state: String,
      city: String,
      isRemote: {
        type: Boolean,
        default: true,
      },
      willingToTravel: {
        type: Boolean,
        default: false,
      },
      serviceAreas: [String],
    },

    // ============================================
    // Verification & Credentials
    // ============================================
    verification: {
      status: {
        type: String,
        enum: ['pending', 'in_review', 'verified', 'rejected'],
        default: 'pending',
        index: true,
      },
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rejectionReason: String,

      documents: [
        {
          type: {
            type: String,
            enum: [
              'id_proof',
              'address_proof',
              'education_certificate',
              'experience_letter',
              'business_registration',
              'professional_license',
              'other',
            ],
            required: true,
          },
          documentUrl: {
            type: String,
            required: true,
          },
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
          verified: {
            type: Boolean,
            default: false,
          },
          verifiedAt: Date,
          notes: String,
        },
      ],

      identityVerified: {
        type: Boolean,
        default: false,
      },

      backgroundCheckCompleted: {
        type: Boolean,
        default: false,
      },
    },

    // ============================================
    // Mentor Level & Badges
    // ============================================
    mentorLevel: {
      type: String,
      enum: ['new', 'associate', 'senior', 'expert', 'master'],
      default: 'new',
      index: true,
    },

    isTopMentor: {
      type: Boolean,
      default: false,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    isPremium: {
      type: Boolean,
      default: false,
    },

    badges: [
      {
        name: String,
        description: String,
        icon: String,
        color: String,
        earnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ============================================
    // Statistics & Performance
    // ============================================
    stats: {
      totalSessions: {
        type: Number,
        default: 0,
      },
      completedSessions: {
        type: Number,
        default: 0,
      },
      cancelledSessions: {
        type: Number,
        default: 0,
      },
      totalMentees: {
        type: Number,
        default: 0,
      },
      activeMentees: {
        type: Number,
        default: 0,
      },
      totalHours: {
        type: Number,
        default: 0,
      },
      totalEarnings: {
        type: Number,
        default: 0,
      },
      responseRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 100,
      },
      averageResponseTime: {
        type: Number, // in hours
        default: 24,
      },
      profileViews: {
        type: Number,
        default: 0,
      },
      profileCompletion: {
        type: Number,
        min: 0,
        max: 100,
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
        mentee: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        session: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MentorSession',
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
        title: String,
        comment: {
          type: String,
          maxlength: 1000,
        },
        aspects: {
          communication: { type: Number, min: 1, max: 5 },
          knowledge: { type: Number, min: 1, max: 5 },
          helpfulness: { type: Number, min: 1, max: 5 },
          professionalism: { type: Number, min: 1, max: 5 },
        },
        wouldRecommend: {
          type: Boolean,
          default: true,
        },
        response: {
          content: String,
          respondedAt: Date,
        },
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

    // ============================================
    // Content Contributions
    // ============================================
    uploadedResources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearningResource',
      },
    ],

    createdRoadmaps: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Roadmap',
      },
    ],

    // ============================================
    // Q&A Contributions
    // ============================================
    qAndA: [
      {
        question: {
          type: String,
          required: true,
        },
        askedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        answer: {
          type: String,
        },
        answeredAt: Date,
        isPublic: {
          type: Boolean,
          default: true,
        },
        helpful: {
          type: Number,
          default: 0,
        },
        askedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ============================================
    // Social & Professional Links
    // ============================================
    socialLinks: {
      linkedin: {
        type: String,
        default: '',
      },
      twitter: {
        type: String,
        default: '',
      },
      website: {
        type: String,
        default: '',
      },
      youtube: {
        type: String,
        default: '',
      },
      instagram: {
        type: String,
        default: '',
      },
      medium: {
        type: String,
        default: '',
      },
      github: {
        type: String,
        default: '',
      },
    },

    // ============================================
    // Portfolio & Success Stories
    // ============================================
    portfolio: [
      {
        title: String,
        description: String,
        image: String,
        link: String,
        year: Number,
      },
    ],

    successStories: [
      {
        menteeName: String,
        story: String,
        outcome: String,
        year: Number,
        image: String,
      },
    ],

    // ============================================
    // Preferences
    // ============================================
    preferences: {
      notifications: {
        newBookings: { type: Boolean, default: true },
        reminders: { type: Boolean, default: true },
        reviews: { type: Boolean, default: true },
        messages: { type: Boolean, default: true },
      },
      autoAccept: {
        type: Boolean,
        default: false,
      },
      minimumNotice: {
        type: Number, // in hours
        default: 24,
      },
      maxAdvanceBooking: {
        type: Number, // in days
        default: 30,
      },
      allowMessages: {
        type: Boolean,
        default: true,
      },
    },

    // ============================================
    // Status
    // ============================================
    status: {
      type: String,
      enum: ['pending_approval', 'active', 'inactive', 'suspended', 'blocked'],
      default: 'pending_approval',
      index: true,
    },

    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    // ============================================
    // Reporting
    // ============================================
    reports: [
      {
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: String,
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
mentorSchema.index({ title: 'text', professionalBio: 'text', specializations: 'text' });
mentorSchema.index({ expertiseCategories: 1 });
mentorSchema.index({ 'rating.average': -1 });
mentorSchema.index({ 'stats.totalSessions': -1 });
mentorSchema.index({ mentorLevel: 1, isActive: 1 });

// ============================================
// Virtual Fields
// ============================================

// Full experience text
mentorSchema.virtual('experienceText').get(function () {
  return `${this.totalExperience} years`;
});

// Is available now
mentorSchema.virtual('isAvailableNow').get(function () {
  if (!this.availability.isAvailable) return false;
  if (this.availability.vacationMode?.isOn) {
    const now = new Date();
    if (this.availability.vacationMode.startDate <= now && this.availability.vacationMode.endDate >= now) {
      return false;
    }
  }
  return true;
});

// Completion rate
mentorSchema.virtual('completionRate').get(function () {
  if (this.stats.totalSessions === 0) return 100;
  return Math.round((this.stats.completedSessions / this.stats.totalSessions) * 100);
});

// URL
mentorSchema.virtual('url').get(function () {
  return `/mentors/${this.slug}`;
});

// ============================================
// Pre-save Middleware
// ============================================

// Generate slug from user name (need to populate user first)
mentorSchema.pre('save', async function (next) {
  if (this.isNew && !this.slug) {
    try {
      await this.populate('user', 'name');
      const baseSlug = slugify(this.user.name, { lower: true, strict: true });
      const uniqueSuffix = Math.random().toString(36).substring(2, 7);
      this.slug = `${baseSlug}-${uniqueSuffix}`;
    } catch (error) {
      this.slug = `mentor-${Date.now()}`;
    }
  }
  next();
});

// Calculate profile completion
mentorSchema.pre('save', function (next) {
  let score = 0;
  const totalFields = 15;

  if (this.title) score++;
  if (this.tagline) score++;
  if (this.professionalBio && this.professionalBio.length > 100) score++;
  if (this.expertise.length > 0) score++;
  if (this.expertiseCategories.length > 0) score++;
  if (this.totalExperience > 0) score++;
  if (this.workExperience.length > 0) score++;
  if (this.education.length > 0) score++;
  if (this.certifications.length > 0) score++;
  if (this.mentorshipTypes.length > 0) score++;
  if (this.availability.workingDays.length > 0) score++;
  if (this.pricing.sessionRates.length > 0 || this.pricing.isFree) score++;
  if (this.languages.length > 0) score++;
  if (this.location.city) score++;
  if (this.socialLinks.linkedin || this.socialLinks.website) score++;

  this.stats.profileCompletion = Math.round((score / totalFields) * 100);
  next();
});

// Auto SEO
mentorSchema.pre('save', function (next) {
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = `${this.title} | Mentor at EntreSkillHub`.substring(0, 60);
  }
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = this.shortBio || this.professionalBio.substring(0, 160);
  }
  next();
});

// ============================================
// Instance Methods
// ============================================

// Increment profile views
mentorSchema.methods.incrementProfileViews = async function () {
  this.stats.profileViews += 1;
  return await this.save({ validateBeforeSave: false });
};

// Add review
mentorSchema.methods.addReview = async function (menteeId, sessionId, reviewData) {
  const { rating, title, comment, aspects, wouldRecommend } = reviewData;

  this.reviews.push({
    mentee: menteeId,
    session: sessionId,
    rating,
    title,
    comment,
    aspects,
    wouldRecommend,
  });

  const currentTotal = this.rating.average * this.rating.total;
  this.rating.total += 1;
  this.rating.average = (currentTotal + rating) / this.rating.total;

  const stars = ['one', 'two', 'three', 'four', 'five'];
  this.rating.distribution[stars[rating - 1]] += 1;

  return await this.save({ validateBeforeSave: false });
};

// Complete session
mentorSchema.methods.completeSession = async function (duration, earnings) {
  this.stats.totalSessions += 1;
  this.stats.completedSessions += 1;
  this.stats.totalHours += duration / 60;
  this.stats.totalEarnings += earnings;
  this.lastActiveAt = Date.now();

  await this.updateMentorLevel();
  return await this.save({ validateBeforeSave: false });
};

// Update mentor level based on performance
mentorSchema.methods.updateMentorLevel = async function () {
  const sessions = this.stats.completedSessions;
  const rating = this.rating.average;

  if (sessions >= 500 && rating >= 4.8) {
    this.mentorLevel = 'master';
  } else if (sessions >= 200 && rating >= 4.5) {
    this.mentorLevel = 'expert';
  } else if (sessions >= 50 && rating >= 4.0) {
    this.mentorLevel = 'senior';
  } else if (sessions >= 10) {
    this.mentorLevel = 'associate';
  } else {
    this.mentorLevel = 'new';
  }
};

// Answer question
mentorSchema.methods.answerQuestion = async function (questionId, answer) {
  const question = this.qAndA.id(questionId);
  if (question) {
    question.answer = answer;
    question.answeredAt = Date.now();
    return await this.save({ validateBeforeSave: false });
  }
  throw new Error('Question not found');
};

// Check availability for time slot
mentorSchema.methods.isSlotAvailable = function (day, time) {
  if (!this.availability.isAvailable) return false;

  const dayLower = day.toLowerCase();
  const workingDay = this.availability.workingDays.find((d) => d.day === dayLower);
  if (!workingDay) return false;

  return workingDay.slots.some((slot) => time >= slot.startTime && time <= slot.endTime);
};

// ============================================
// Static Methods
// ============================================

// Get top mentors
mentorSchema.statics.getTopMentors = function (limit = 10) {
  return this.find({
    isActive: true,
    'verification.status': 'verified',
    isTopMentor: true,
  })
    .sort({ 'rating.average': -1, 'stats.totalSessions': -1 })
    .limit(limit)
    .populate('user', 'name email profileImage');
};

// Get featured mentors
mentorSchema.statics.getFeatured = function (limit = 10) {
  return this.find({
    isActive: true,
    isFeatured: true,
    'verification.status': 'verified',
  })
    .sort({ 'rating.average': -1 })
    .limit(limit)
    .populate('user', 'name email profileImage');
};

// Get mentors by category
mentorSchema.statics.getByCategory = function (category, limit = 20) {
  return this.find({
    expertiseCategories: category,
    isActive: true,
    'verification.status': 'verified',
  })
    .sort({ 'rating.average': -1 })
    .limit(limit)
    .populate('user', 'name email profileImage');
};

// Search mentors
mentorSchema.statics.searchMentors = function (query, filters = {}) {
  return this.find({
    $and: [
      { isActive: true, 'verification.status': 'verified' },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { professionalBio: { $regex: query, $options: 'i' } },
          { specializations: { $in: [new RegExp(query, 'i')] } },
          { industries: { $in: [new RegExp(query, 'i')] } },
        ],
      },
      filters,
    ],
  }).populate('user', 'name email profileImage');
};

// ============================================
// Export Model
// ============================================
const Mentor = mongoose.model('Mentor', mentorSchema);

module.exports = Mentor;