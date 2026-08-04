// ============================================
// EntreSkillHub - Progress Tracking Model
// User's journey and progress across platform
// ============================================

const mongoose = require('mongoose');

// ============================================
// Sub-schema for Step Progress
// ============================================
const stepProgressSchema = new mongoose.Schema(
  {
    stepNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    stepId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    status: {
      type: String,
      enum: {
        values: ['not_started', 'in_progress', 'completed', 'skipped', 'blocked'],
        message: '{VALUE} is not a valid step status',
      },
      default: 'not_started',
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },

    completedTasks: [
      {
        taskId: String,
        completedAt: {
          type: Date,
          default: Date.now,
        },
        timeSpent: Number,
      },
    ],

    completedChecklistItems: [
      {
        itemId: String,
        itemText: String,
        completedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    userNotes: {
      type: String,
      maxlength: 5000,
      default: '',
    },

    reflections: {
      whatWentWell: String,
      challenges: String,
      lessonsLearned: String,
      nextSteps: String,
    },

    attachments: [
      {
        name: String,
        url: String,
        publicId: String,
        type: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    proofOfCompletion: [
      {
        type: {
          type: String,
          enum: ['document', 'image', 'link', 'text'],
        },
        content: String,
        description: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    skippedReason: {
      type: String,
      default: '',
    },

    blockedReason: {
      type: String,
      default: '',
    },

    blockerResolution: {
      type: String,
      default: '',
    },

    difficulty: {
      type: String,
      enum: ['easier_than_expected', 'as_expected', 'harder_than_expected'],
    },

    helpfulness: {
      type: Number,
      min: 1,
      max: 5,
    },

    feedback: {
      type: String,
      maxlength: 1000,
    },
  },
  { _id: true, timestamps: true }
);

// ============================================
// Sub-schema for Resource Progress
// ============================================
const resourceProgressSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningResource',
      required: true,
    },

    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'bookmarked'],
      default: 'not_started',
    },

    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    startedAt: Date,
    completedAt: Date,
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },

    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },

    // For videos/courses
    lastPosition: {
      type: Number, // in seconds
      default: 0,
    },

    watchedDuration: {
      type: Number,
      default: 0,
    },

    // For quizzes
    quizScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    quizAttempts: [
      {
        attemptedAt: {
          type: Date,
          default: Date.now,
        },
        score: Number,
        correctAnswers: Number,
        totalQuestions: Number,
        timeSpent: Number,
      },
    ],

    // For checklists
    completedChecklistItems: [String],

    // For courses (multi-lesson)
    completedLessons: [
      {
        lessonNumber: Number,
        completedAt: Date,
        timeSpent: Number,
      },
    ],

    notes: {
      type: String,
      maxlength: 5000,
      default: '',
    },

    bookmarks: [
      {
        timestamp: Number, // For videos
        title: String,
        note: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    highlights: [
      {
        text: String,
        note: String,
        color: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    review: String,
  },
  { _id: true, timestamps: true }
);

// ============================================
// Main Progress Schema
// ============================================
const progressSchema = new mongoose.Schema(
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
    // Business Idea & Roadmap
    // ============================================
    businessIdea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessIdea',
      required: [true, 'Business idea reference is required'],
      index: true,
    },

    roadmap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: [true, 'Roadmap reference is required'],
      index: true,
    },

    // ============================================
    // Overall Status
    // ============================================
    status: {
      type: String,
      enum: {
        values: ['enrolled', 'in_progress', 'paused', 'completed', 'abandoned'],
        message: '{VALUE} is not a valid status',
      },
      default: 'enrolled',
      index: true,
    },

    currentPhase: {
      type: String,
      enum: [
        'idea_validation',
        'planning',
        'skill_building',
        'legal_setup',
        'financial_setup',
        'infrastructure',
        'branding',
        'marketing',
        'launch',
        'operations',
        'growth',
        'scaling',
      ],
      default: 'idea_validation',
    },

    currentStep: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ============================================
    // Steps Progress
    // ============================================
    stepsProgress: [stepProgressSchema],

    completedSteps: {
      type: Number,
      default: 0,
    },

    totalSteps: {
      type: Number,
      default: 0,
    },

    skippedSteps: {
      type: Number,
      default: 0,
    },

    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // ============================================
    // Resources Progress
    // ============================================
    resourcesProgress: [resourceProgressSchema],

    completedResources: {
      type: Number,
      default: 0,
    },

    bookmarkedResources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearningResource',
      },
    ],

    // ============================================
    // Time Tracking
    // ============================================
    totalTimeSpent: {
      type: Number, // in seconds
      default: 0,
    },

    averageTimePerStep: {
      type: Number, // in seconds
      default: 0,
    },

    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    streakDays: {
      type: Number,
      default: 0,
    },

    longestStreak: {
      type: Number,
      default: 0,
    },

    lastActivityDate: {
      type: Date,
      default: null,
    },

    activityCalendar: [
      {
        date: Date,
        minutesSpent: Number,
        actionsPerformed: Number,
      },
    ],

    // ============================================
    // Milestones Achieved
    // ============================================
    milestones: [
      {
        milestoneId: String,
        title: String,
        description: String,
        achievedAt: {
          type: Date,
          default: Date.now,
        },
        atStep: Number,
        badge: {
          name: String,
          icon: String,
          color: String,
        },
      },
    ],

    // ============================================
    // Achievements & Badges
    // ============================================
    achievements: [
      {
        badgeId: String,
        name: String,
        description: String,
        icon: String,
        category: {
          type: String,
          enum: ['streak', 'completion', 'engagement', 'milestone', 'special'],
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
        points: {
          type: Number,
          default: 0,
        },
      },
    ],

    totalPoints: {
      type: Number,
      default: 0,
    },

    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    experience: {
      type: Number,
      default: 0,
    },

    // ============================================
    // Enrollment Details
    // ============================================
    enrolledAt: {
      type: Date,
      default: Date.now,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    pausedAt: {
      type: Date,
      default: null,
    },

    pauseReason: {
      type: String,
      default: '',
    },

    resumedAt: {
      type: Date,
      default: null,
    },

    abandonedAt: {
      type: Date,
      default: null,
    },

    abandonReason: {
      type: String,
      default: '',
    },

    // ============================================
    // Certificate
    // ============================================
    certificate: {
      isEligible: {
        type: Boolean,
        default: false,
      },
      isIssued: {
        type: Boolean,
        default: false,
      },
      certificateId: String,
      certificateUrl: String,
      issuedAt: Date,
      certificateType: {
        type: String,
        enum: ['completion', 'excellence', 'achievement'],
      },
    },

    // ============================================
    // Goals & Targets
    // ============================================
    goals: [
      {
        title: {
          type: String,
          required: true,
        },
        description: String,
        targetDate: Date,
        isAchieved: {
          type: Boolean,
          default: false,
        },
        achievedAt: Date,
        priority: {
          type: String,
          enum: ['low', 'medium', 'high'],
          default: 'medium',
        },
      },
    ],

    weeklyTarget: {
      hoursGoal: {
        type: Number,
        default: 5,
      },
      stepsGoal: {
        type: Number,
        default: 1,
      },
    },

    // ============================================
    // Reminders & Preferences
    // ============================================
    reminders: {
      isEnabled: {
        type: Boolean,
        default: true,
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'custom'],
        default: 'weekly',
      },
      preferredDays: [
        {
          type: String,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        },
      ],
      preferredTime: {
        type: String,
        default: '10:00',
      },
    },

    // ============================================
    // Feedback & Reflection
    // ============================================
    reflections: [
      {
        type: {
          type: String,
          enum: ['weekly', 'monthly', 'milestone', 'completion'],
        },
        title: String,
        content: {
          type: String,
          maxlength: 5000,
        },
        mood: {
          type: String,
          enum: ['excited', 'motivated', 'neutral', 'challenged', 'frustrated'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    challenges: [
      {
        description: String,
        atStep: Number,
        isResolved: {
          type: Boolean,
          default: false,
        },
        resolution: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        resolvedAt: Date,
      },
    ],

    wins: [
      {
        title: String,
        description: String,
        atStep: Number,
        celebratedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ============================================
    // Mentor Interactions
    // ============================================
    mentorSessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MentorSession',
      },
    ],

    questionsAsked: {
      type: Number,
      default: 0,
    },

    helpRequests: [
      {
        atStep: Number,
        question: String,
        status: {
          type: String,
          enum: ['open', 'answered', 'closed'],
          default: 'open',
        },
        askedAt: {
          type: Date,
          default: Date.now,
        },
        answeredAt: Date,
      },
    ],

    // ============================================
    // Financial Tracking
    // ============================================
    financialData: {
      plannedInvestment: {
        type: Number,
        default: 0,
      },
      actualInvestment: {
        type: Number,
        default: 0,
      },
      expenses: [
        {
          category: String,
          description: String,
          amount: Number,
          date: {
            type: Date,
            default: Date.now,
          },
          atStep: Number,
        },
      ],
      revenue: [
        {
          source: String,
          amount: Number,
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

    // ============================================
    // Rating & Review
    // ============================================
    roadmapRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      review: String,
      submittedAt: Date,
    },

    // ============================================
    // Sharing & Social
    // ============================================
    isPublic: {
      type: Boolean,
      default: false,
    },

    sharedProgress: [
      {
        platform: String,
        sharedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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
progressSchema.index({ user: 1, roadmap: 1 }, { unique: true });
progressSchema.index({ user: 1, status: 1 });
progressSchema.index({ lastActivityAt: -1 });
progressSchema.index({ completionPercentage: -1 });

// ============================================
// Virtual Fields
// ============================================

// Days since enrollment
progressSchema.virtual('daysSinceEnrollment').get(function () {
  const diff = Date.now() - this.enrolledAt.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Days to complete
progressSchema.virtual('daysToComplete').get(function () {
  if (!this.completedAt || !this.startedAt) return null;
  const diff = this.completedAt.getTime() - this.startedAt.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Is on track
progressSchema.virtual('isOnTrack').get(function () {
  const daysSinceEnrollment = this.daysSinceEnrollment;
  const expectedProgress = Math.min((daysSinceEnrollment / 30) * 100, 100);
  return this.completionPercentage >= expectedProgress * 0.8;
});

// Total ROI
progressSchema.virtual('roi').get(function () {
  if (this.financialData.actualInvestment === 0) return 0;
  const totalRevenue = this.financialData.revenue.reduce((sum, r) => sum + r.amount, 0);
  return Math.round(((totalRevenue - this.financialData.actualInvestment) / this.financialData.actualInvestment) * 100);
});

// ============================================
// Pre-save Middleware
// ============================================

// Calculate completion percentage
progressSchema.pre('save', function (next) {
  if (this.totalSteps > 0) {
    this.completionPercentage = Math.round((this.completedSteps / this.totalSteps) * 100);
  }

  // Update level based on experience
  const newLevel = Math.floor(this.experience / 100) + 1;
  if (newLevel > this.level) {
    this.level = newLevel;
  }

  // Update total points
  this.totalPoints = this.achievements.reduce((sum, a) => sum + (a.points || 0), 0);

  next();
});

// Update status based on progress
progressSchema.pre('save', function (next) {
  if (this.completionPercentage === 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = Date.now();
    this.certificate.isEligible = true;
  } else if (this.completionPercentage > 0 && this.status === 'enrolled') {
    this.status = 'in_progress';
    if (!this.startedAt) this.startedAt = Date.now();
  }
  next();
});

// ============================================
// Instance Methods
// ============================================

// Update step status
progressSchema.methods.updateStepStatus = async function (stepNumber, status, additionalData = {}) {
  let stepProgress = this.stepsProgress.find((sp) => sp.stepNumber === stepNumber);

  if (!stepProgress) {
    this.stepsProgress.push({ stepNumber, status, ...additionalData });
    stepProgress = this.stepsProgress[this.stepsProgress.length - 1];
  } else {
    stepProgress.status = status;
    Object.assign(stepProgress, additionalData);
  }

  if (status === 'in_progress' && !stepProgress.startedAt) {
    stepProgress.startedAt = Date.now();
  } else if (status === 'completed' && !stepProgress.completedAt) {
    stepProgress.completedAt = Date.now();
    this.completedSteps = this.stepsProgress.filter((sp) => sp.status === 'completed').length;
    await this.addExperience(10);
  } else if (status === 'skipped') {
    this.skippedSteps = this.stepsProgress.filter((sp) => sp.status === 'skipped').length;
  }

  this.currentStep = stepNumber;
  this.lastActivityAt = Date.now();
  return await this.save();
};

// Complete a task within a step
progressSchema.methods.completeTask = async function (stepNumber, taskId, timeSpent = 0) {
  const stepProgress = this.stepsProgress.find((sp) => sp.stepNumber === stepNumber);
  if (!stepProgress) throw new Error('Step not found in progress');

  stepProgress.completedTasks.push({ taskId, timeSpent });
  stepProgress.timeSpent += timeSpent;
  this.totalTimeSpent += timeSpent;

  return await this.save();
};

// Add experience points
progressSchema.methods.addExperience = async function (points) {
  this.experience += points;
  const newLevel = Math.floor(this.experience / 100) + 1;
  if (newLevel > this.level) {
    this.level = newLevel;
    await this.awardAchievement({
      name: `Level ${newLevel} Achieved`,
      description: `Reached level ${newLevel}!`,
      category: 'engagement',
      icon: '⭐',
      points: 20,
    });
  }
  return await this.save();
};

// Award achievement
progressSchema.methods.awardAchievement = async function (achievementData) {
  const exists = this.achievements.find((a) => a.name === achievementData.name);
  if (!exists) {
    this.achievements.push(achievementData);
    return await this.save();
  }
  return this;
};

// Update streak
progressSchema.methods.updateStreak = async function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!this.lastActivityDate) {
    this.streakDays = 1;
  } else {
    const lastDate = new Date(this.lastActivityDate);
    lastDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day, no change
    } else if (diffDays === 1) {
      this.streakDays += 1;
      if (this.streakDays > this.longestStreak) {
        this.longestStreak = this.streakDays;
      }
    } else {
      this.streakDays = 1;
    }
  }

  this.lastActivityDate = today;

  // Award streak achievements
  const streakMilestones = [7, 30, 100, 365];
  if (streakMilestones.includes(this.streakDays)) {
    await this.awardAchievement({
      name: `${this.streakDays}-Day Streak`,
      description: `Maintained activity for ${this.streakDays} consecutive days!`,
      category: 'streak',
      icon: '🔥',
      points: this.streakDays,
    });
  }

  return await this.save();
};

// Track resource progress
progressSchema.methods.updateResourceProgress = async function (resourceId, progressData) {
  let resourceProgress = this.resourcesProgress.find(
    (rp) => rp.resource.toString() === resourceId.toString()
  );

  if (!resourceProgress) {
    this.resourcesProgress.push({ resource: resourceId, ...progressData });
  } else {
    Object.assign(resourceProgress, progressData);
    resourceProgress.lastAccessedAt = Date.now();
  }

  this.completedResources = this.resourcesProgress.filter((rp) => rp.status === 'completed').length;
  return await this.save();
};

// Add expense
progressSchema.methods.addExpense = async function (category, description, amount, atStep) {
  this.financialData.expenses.push({ category, description, amount, atStep });
  this.financialData.actualInvestment += amount;
  return await this.save();
};

// Add revenue
progressSchema.methods.addRevenue = async function (source, amount) {
  this.financialData.revenue.push({ source, amount });
  return await this.save();
};

// Pause progress
progressSchema.methods.pauseProgress = async function (reason) {
  this.status = 'paused';
  this.pausedAt = Date.now();
  this.pauseReason = reason;
  return await this.save();
};

// Resume progress
progressSchema.methods.resumeProgress = async function () {
  this.status = 'in_progress';
  this.resumedAt = Date.now();
  this.pausedAt = null;
  this.pauseReason = '';
  return await this.save();
};

// ============================================
// Static Methods
// ============================================

// Get user's active progress
progressSchema.statics.getActiveProgress = function (userId) {
  return this.find({
    user: userId,
    status: { $in: ['enrolled', 'in_progress'] },
  })
    .populate('businessIdea roadmap')
    .sort({ lastActivityAt: -1 });
};

// Get completed progress
progressSchema.statics.getCompletedProgress = function (userId) {
  return this.find({ user: userId, status: 'completed' })
    .populate('businessIdea roadmap')
    .sort({ completedAt: -1 });
};

// Get statistics for user
progressSchema.statics.getUserStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalEnrolled: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        totalTimeSpent: { $sum: '$totalTimeSpent' },
        totalPoints: { $sum: '$totalPoints' },
        avgCompletion: { $avg: '$completionPercentage' },
      },
    },
  ]);

  return stats[0] || {};
};

// ============================================
// Export Model
// ============================================
const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;