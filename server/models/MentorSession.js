// ============================================
// EntreSkillHub - Mentor Session Model
// Session bookings between mentors and mentees
// ============================================

const mongoose = require('mongoose');
const crypto = require('crypto');

const mentorSessionSchema = new mongoose.Schema(
  {
    // ============================================
    // Unique Session Identifier
    // ============================================
    sessionId: {
      type: String,
      unique: true,
      index: true,
    },

    // ============================================
    // Participants
    // ============================================
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mentor',
      required: [true, 'Mentor reference is required'],
      index: true,
    },

    mentorUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mentor user reference is required'],
    },

    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mentee reference is required'],
      index: true,
    },

    // ============================================
    // Session Details
    // ============================================
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },

    sessionType: {
      type: String,
      required: [true, 'Session type is required'],
      enum: {
        values: [
          'one_on_one',
          'group_session',
          'workshop',
          'q_and_a',
          'code_review',
          'business_review',
          'strategy_session',
          'consultation',
          'follow_up',
          'trial_session',
        ],
        message: '{VALUE} is not a valid session type',
      },
      index: true,
    },

    mode: {
      type: String,
      required: [true, 'Session mode is required'],
      enum: ['online', 'in_person', 'phone'],
      default: 'online',
    },

    // ============================================
    // Related Content
    // ============================================
    relatedBusinessIdea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessIdea',
      default: null,
    },

    relatedRoadmap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      default: null,
    },

    relatedSkills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],

    topics: [
      {
        type: String,
        trim: true,
      },
    ],

    // ============================================
    // Scheduling
    // ============================================
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
      index: true,
      validate: {
        validator: function (value) {
          // Allow past dates only for existing sessions
          if (this.isNew) {
            return value > new Date();
          }
          return true;
        },
        message: 'Scheduled date must be in the future',
      },
    },

    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide valid time in HH:mm format'],
    },

    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please provide valid time in HH:mm format'],
    },

    duration: {
      type: Number, // in minutes
      required: [true, 'Duration is required'],
      min: [15, 'Session must be at least 15 minutes'],
      max: [480, 'Session cannot exceed 8 hours'],
      default: 60,
    },

    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },

    // ============================================
    // Session Status
    // ============================================
    status: {
      type: String,
      enum: {
        values: [
          'pending',
          'confirmed',
          'in_progress',
          'completed',
          'cancelled',
          'rescheduled',
          'no_show',
          'refunded',
        ],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
      index: true,
    },

    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: String,
        notes: String,
      },
    ],

    // ============================================
    // Meeting Details (for online sessions)
    // ============================================
    meetingDetails: {
      platform: {
        type: String,
        enum: ['zoom', 'google_meet', 'microsoft_teams', 'skype', 'jitsi', 'other', 'custom'],
        default: 'google_meet',
      },
      meetingLink: {
        type: String,
        default: '',
      },
      meetingId: {
        type: String,
        default: '',
      },
      password: {
        type: String,
        default: '',
      },
      dialInNumber: {
        type: String,
        default: '',
      },
      hostKey: {
        type: String,
        select: false,
      },
      recordingUrl: {
        type: String,
        default: '',
      },
      recordingAvailable: {
        type: Boolean,
        default: false,
      },
    },

    // ============================================
    // In-Person Meeting Details
    // ============================================
    locationDetails: {
      venue: {
        type: String,
        default: '',
      },
      address: {
        type: String,
        default: '',
      },
      city: String,
      state: String,
      pincode: String,
      landmark: String,
      googleMapsLink: String,
      instructions: String,
    },

    // ============================================
    // Pricing & Payment
    // ============================================
    pricing: {
      amount: {
        type: Number,
        min: 0,
        required: [true, 'Amount is required'],
        default: 0,
      },
      currency: {
        type: String,
        default: 'INR',
      },
      isFree: {
        type: Boolean,
        default: false,
      },
      discount: {
        code: String,
        amount: {
          type: Number,
          default: 0,
        },
        percentage: {
          type: Number,
          default: 0,
        },
      },
      tax: {
        type: Number,
        default: 0,
      },
      finalAmount: {
        type: Number,
        min: 0,
        default: 0,
      },
      mentorEarnings: {
        type: Number,
        min: 0,
        default: 0,
      },
      platformFee: {
        type: Number,
        min: 0,
        default: 0,
      },
    },

    payment: {
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partial_refund', 'not_required'],
        default: 'pending',
      },
      method: {
        type: String,
        enum: ['upi', 'card', 'net_banking', 'wallet', 'cash', 'bank_transfer', 'free', 'other'],
      },
      transactionId: {
        type: String,
        default: '',
      },
      paymentGateway: {
        type: String,
        default: '',
      },
      paidAt: {
        type: Date,
        default: null,
      },
      refundedAt: {
        type: Date,
        default: null,
      },
      refundAmount: {
        type: Number,
        default: 0,
      },
      refundReason: String,
      invoiceNumber: String,
      invoiceUrl: String,
    },

    // ============================================
    // Mentee's Purpose & Goals
    // ============================================
    menteeGoals: {
      primaryGoal: {
        type: String,
        trim: true,
        maxlength: [500, 'Primary goal cannot exceed 500 characters'],
      },
      specificQuestions: [
        {
          type: String,
          trim: true,
        },
      ],
      expectedOutcomes: [String],
      preparationNotes: String,
      currentChallenges: String,
    },

    // ============================================
    // Pre-Session Information
    // ============================================
    preSession: {
      questionsFromMentee: [
        {
          question: String,
          askedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      documentsShared: [
        {
          name: String,
          url: String,
          sharedBy: {
            type: String,
            enum: ['mentor', 'mentee'],
          },
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      preReadingMaterial: [String],
      agenda: [
        {
          topic: String,
          duration: Number, // in minutes
          order: Number,
        },
      ],
    },

    // ============================================
    // Session Notes & Content
    // ============================================
    sessionNotes: {
      mentorNotes: {
        type: String,
        default: '',
        maxlength: [10000, 'Notes cannot exceed 10000 characters'],
      },
      menteeNotes: {
        type: String,
        default: '',
        maxlength: [10000, 'Notes cannot exceed 10000 characters'],
      },
      sharedNotes: {
        type: String,
        default: '',
      },
      keyTakeaways: [
        {
          takeaway: String,
          addedBy: {
            type: String,
            enum: ['mentor', 'mentee'],
          },
        },
      ],
      actionItems: [
        {
          item: {
            type: String,
            required: true,
          },
          assignedTo: {
            type: String,
            enum: ['mentor', 'mentee', 'both'],
          },
          dueDate: Date,
          isCompleted: {
            type: Boolean,
            default: false,
          },
          completedAt: Date,
          priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
          },
        },
      ],
      resourcesShared: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'LearningResource',
        },
      ],
      externalLinks: [
        {
          title: String,
          url: String,
          description: String,
        },
      ],
    },

    // ============================================
    // Post-Session Follow-Up
    // ============================================
    postSession: {
      summary: {
        type: String,
        default: '',
      },
      nextSteps: [String],
      followUpRequired: {
        type: Boolean,
        default: false,
      },
      followUpDate: Date,
      followUpSessionBooked: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MentorSession',
      },
      certificateIssued: {
        type: Boolean,
        default: false,
      },
      certificateUrl: String,
    },

    // ============================================
    // Actual Timing
    // ============================================
    actualStartTime: {
      type: Date,
      default: null,
    },

    actualEndTime: {
      type: Date,
      default: null,
    },

    actualDuration: {
      type: Number, // in minutes
      default: 0,
    },

    joinedAt: {
      mentor: Date,
      mentee: Date,
    },

    // ============================================
    // Cancellation Details
    // ============================================
    cancellation: {
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      cancelledByRole: {
        type: String,
        enum: ['mentor', 'mentee', 'admin', 'system'],
      },
      cancelledAt: {
        type: Date,
        default: null,
      },
      reason: {
        type: String,
        enum: [
          'schedule_conflict',
          'personal_emergency',
          'not_interested',
          'found_alternative',
          'technical_issues',
          'mentor_unavailable',
          'other',
        ],
      },
      description: String,
      isRefundable: {
        type: Boolean,
        default: true,
      },
    },

    // ============================================
    // Rescheduling Details
    // ============================================
    rescheduling: {
      isRescheduled: {
        type: Boolean,
        default: false,
      },
      originalDate: Date,
      originalTime: String,
      rescheduledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rescheduledAt: Date,
      reason: String,
      rescheduleCount: {
        type: Number,
        default: 0,
        max: 3,
      },
    },

    // ============================================
    // Reviews & Feedback
    // ============================================
    menteeReview: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
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
        valueForMoney: { type: Number, min: 1, max: 5 },
      },
      wouldRecommend: {
        type: Boolean,
        default: true,
      },
      wouldBookAgain: {
        type: Boolean,
        default: true,
      },
      submittedAt: Date,
    },

    mentorReview: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        maxlength: 1000,
      },
      menteeEngagement: {
        type: String,
        enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
      },
      menteePreparation: {
        type: String,
        enum: ['unprepared', 'somewhat_prepared', 'well_prepared'],
      },
      submittedAt: Date,
    },

    // ============================================
    // Reminders & Notifications
    // ============================================
    reminders: {
      sent: [
        {
          type: {
            type: String,
            enum: ['booking_confirmation', '24_hour_before', '1_hour_before', '15_min_before', 'follow_up'],
          },
          sentAt: {
            type: Date,
            default: Date.now,
          },
          channel: {
            type: String,
            enum: ['email', 'sms', 'push', 'in_app'],
          },
          recipient: {
            type: String,
            enum: ['mentor', 'mentee', 'both'],
          },
          status: {
            type: String,
            enum: ['sent', 'delivered', 'failed'],
          },
        },
      ],
    },

    // ============================================
    // Communication
    // ============================================
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        senderRole: {
          type: String,
          enum: ['mentor', 'mentee'],
        },
        content: {
          type: String,
          required: true,
          maxlength: 2000,
        },
        attachments: [
          {
            name: String,
            url: String,
            type: String,
          },
        ],
        isRead: {
          type: Boolean,
          default: false,
        },
        readAt: Date,
        sentAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ============================================
    // Flags & Special Handling
    // ============================================
    isFirstSession: {
      type: Boolean,
      default: false,
    },

    isTrialSession: {
      type: Boolean,
      default: false,
    },

    isPackageSession: {
      type: Boolean,
      default: false,
    },

    packageId: {
      type: String,
      default: null,
    },

    packageSessionNumber: {
      type: Number,
      default: null,
    },

    isDispute: {
      type: Boolean,
      default: false,
    },

    disputeDetails: {
      raisedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      raisedAt: Date,
      reason: String,
      description: String,
      status: {
        type: String,
        enum: ['open', 'under_review', 'resolved', 'closed'],
        default: 'open',
      },
      resolution: String,
      resolvedAt: Date,
    },

    // ============================================
    // Analytics
    // ============================================
    analytics: {
      viewCount: {
        type: Number,
        default: 0,
      },
      reminderResponseTime: Number,
      confirmationTime: Number, // Time taken to confirm booking
      cancellationLeadTime: Number, // Hours before session it was cancelled
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
mentorSessionSchema.index({ mentor: 1, scheduledDate: 1 });
mentorSessionSchema.index({ mentee: 1, scheduledDate: -1 });
mentorSessionSchema.index({ status: 1, scheduledDate: 1 });
mentorSessionSchema.index({ 'payment.status': 1 });
mentorSessionSchema.index({ createdAt: -1 });

// ============================================
// Virtual Fields
// ============================================

// Time until session
mentorSessionSchema.virtual('timeUntilSession').get(function () {
  if (this.status !== 'confirmed' && this.status !== 'pending') return null;
  const now = new Date();
  const sessionTime = new Date(this.scheduledDate);
  const diff = sessionTime - now;
  return diff > 0 ? diff : null;
});

// Is upcoming
mentorSessionSchema.virtual('isUpcoming').get(function () {
  return ['pending', 'confirmed'].includes(this.status) && new Date(this.scheduledDate) > new Date();
});

// Is past
mentorSessionSchema.virtual('isPast').get(function () {
  return new Date(this.scheduledDate) < new Date();
});

// Can be cancelled
mentorSessionSchema.virtual('canBeCancelled').get(function () {
  if (!['pending', 'confirmed'].includes(this.status)) return false;
  const hoursUntilSession = (new Date(this.scheduledDate) - new Date()) / (1000 * 60 * 60);
  return hoursUntilSession >= 2; // Can cancel up to 2 hours before
});

// ============================================
// Pre-save Middleware
// ============================================

// Generate unique session ID
mentorSessionSchema.pre('save', function (next) {
  if (this.isNew && !this.sessionId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.sessionId = `SES-${timestamp}-${random}`;
  }
  next();
});

// Calculate final amount
mentorSessionSchema.pre('save', function (next) {
  const baseAmount = this.pricing.amount || 0;
  const discountAmount = this.pricing.discount?.amount || 0;
  const discountPercent = this.pricing.discount?.percentage || 0;
  const tax = this.pricing.tax || 0;

  let finalAmount = baseAmount;
  if (discountAmount > 0) {
    finalAmount -= discountAmount;
  } else if (discountPercent > 0) {
    finalAmount -= (finalAmount * discountPercent) / 100;
  }
  finalAmount += tax;

  this.pricing.finalAmount = Math.max(0, finalAmount);

  // Calculate mentor earnings (85% to mentor, 15% platform fee)
  this.pricing.platformFee = this.pricing.finalAmount * 0.15;
  this.pricing.mentorEarnings = this.pricing.finalAmount * 0.85;

  next();
});

// Add status change to history
mentorSessionSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: Date.now(),
    });
  }
  next();
});

// ============================================
// Instance Methods
// ============================================

// Confirm session
mentorSessionSchema.methods.confirm = async function (confirmedBy) {
  this.status = 'confirmed';
  this.statusHistory.push({
    status: 'confirmed',
    changedBy: confirmedBy,
    changedAt: Date.now(),
  });
  this.analytics.confirmationTime = (Date.now() - this.createdAt.getTime()) / 1000;
  return await this.save();
};

// Cancel session
mentorSessionSchema.methods.cancel = async function (cancelledBy, role, reason, description) {
  const hoursUntilSession = (new Date(this.scheduledDate) - new Date()) / (1000 * 60 * 60);

  this.status = 'cancelled';
  this.cancellation = {
    cancelledBy,
    cancelledByRole: role,
    cancelledAt: Date.now(),
    reason,
    description,
    isRefundable: hoursUntilSession >= 24,
  };
  this.analytics.cancellationLeadTime = hoursUntilSession;

  this.statusHistory.push({
    status: 'cancelled',
    changedBy: cancelledBy,
    reason,
  });

  return await this.save();
};

// Reschedule session
mentorSessionSchema.methods.reschedule = async function (newDate, newStartTime, newEndTime, rescheduledBy, reason) {
  if (this.rescheduling.rescheduleCount >= 3) {
    throw new Error('Maximum reschedule limit reached');
  }

  this.rescheduling = {
    isRescheduled: true,
    originalDate: this.scheduledDate,
    originalTime: this.startTime,
    rescheduledBy,
    rescheduledAt: Date.now(),
    reason,
    rescheduleCount: this.rescheduling.rescheduleCount + 1,
  };

  this.scheduledDate = newDate;
  this.startTime = newStartTime;
  this.endTime = newEndTime;
  this.status = 'rescheduled';

  return await this.save();
};

// Start session
mentorSessionSchema.methods.startSession = async function (userRole) {
  if (this.status !== 'confirmed') {
    throw new Error('Session must be confirmed before starting');
  }

  if (userRole === 'mentor') {
    this.joinedAt.mentor = Date.now();
  } else {
    this.joinedAt.mentee = Date.now();
  }

  if (this.joinedAt.mentor && this.joinedAt.mentee) {
    this.status = 'in_progress';
    this.actualStartTime = Date.now();
  }

  return await this.save();
};

// Complete session
mentorSessionSchema.methods.completeSession = async function () {
  if (this.status !== 'in_progress' && this.status !== 'confirmed') {
    throw new Error('Session cannot be completed from current status');
  }

  this.status = 'completed';
  this.actualEndTime = Date.now();

  if (this.actualStartTime) {
    this.actualDuration = Math.round((this.actualEndTime - this.actualStartTime) / (1000 * 60));
  }

  this.statusHistory.push({
    status: 'completed',
    changedAt: Date.now(),
  });

  return await this.save();
};

// Add message
mentorSessionSchema.methods.addMessage = async function (senderId, senderRole, content, attachments = []) {
  this.messages.push({
    sender: senderId,
    senderRole,
    content,
    attachments,
  });
  return await this.save();
};

// Add action item
mentorSessionSchema.methods.addActionItem = async function (item, assignedTo, dueDate, priority = 'medium') {
  this.sessionNotes.actionItems.push({ item, assignedTo, dueDate, priority });
  return await this.save();
};

// Submit mentee review
mentorSessionSchema.methods.submitMenteeReview = async function (reviewData) {
  this.menteeReview = { ...reviewData, submittedAt: Date.now() };
  return await this.save();
};

// Submit mentor review
mentorSessionSchema.methods.submitMentorReview = async function (reviewData) {
  this.mentorReview = { ...reviewData, submittedAt: Date.now() };
  return await this.save();
};

// ============================================
// Static Methods
// ============================================

// Get upcoming sessions for user
mentorSessionSchema.statics.getUpcomingForUser = function (userId, isMentor = false) {
  const query = isMentor ? { mentorUser: userId } : { mentee: userId };
  return this.find({
    ...query,
    status: { $in: ['pending', 'confirmed'] },
    scheduledDate: { $gte: new Date() },
  })
    .sort({ scheduledDate: 1 })
    .populate('mentor mentee mentorUser', 'name email profileImage');
};

// Get past sessions for user
mentorSessionSchema.statics.getPastForUser = function (userId, isMentor = false, limit = 20) {
  const query = isMentor ? { mentorUser: userId } : { mentee: userId };
  return this.find({
    ...query,
    status: { $in: ['completed', 'cancelled', 'no_show'] },
  })
    .sort({ scheduledDate: -1 })
    .limit(limit)
    .populate('mentor mentee mentorUser', 'name email profileImage');
};

// Get mentor's schedule for date range
mentorSessionSchema.statics.getMentorSchedule = function (mentorId, startDate, endDate) {
  return this.find({
    mentor: mentorId,
    scheduledDate: { $gte: startDate, $lte: endDate },
    status: { $in: ['pending', 'confirmed', 'in_progress'] },
  }).sort({ scheduledDate: 1 });
};

// Session statistics
mentorSessionSchema.statics.getStats = async function () {
  return await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.finalAmount' },
        avgDuration: { $avg: '$actualDuration' },
      },
    },
  ]);
};

// Check mentor availability
mentorSessionSchema.statics.checkAvailability = async function (mentorId, date, startTime, endTime) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const conflicts = await this.find({
    mentor: mentorId,
    scheduledDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['pending', 'confirmed', 'in_progress'] },
    $or: [
      { startTime: { $gte: startTime, $lt: endTime } },
      { endTime: { $gt: startTime, $lte: endTime } },
      { $and: [{ startTime: { $lte: startTime } }, { endTime: { $gte: endTime } }] },
    ],
  });

  return conflicts.length === 0;
};

// ============================================
// Export Model
// ============================================
const MentorSession = mongoose.model('MentorSession', mentorSessionSchema);

module.exports = MentorSession;