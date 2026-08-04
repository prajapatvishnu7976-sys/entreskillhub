// ============================================
// EntreSkillHub - Mentor Validators
// ============================================

const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('./authValidator');

// ============================================
// MENTOR REGISTRATION VALIDATION
// ============================================
exports.mentorRegistrationValidation = [
  body('title')
    .trim().notEmpty().withMessage('Professional title is required')
    .isLength({ min: 3, max: 150 }).withMessage('Title must be between 3 and 150 characters'),

  body('tagline').optional().trim().isLength({ max: 200 }),

  body('professionalBio')
    .trim().notEmpty().withMessage('Professional bio is required')
    .isLength({ min: 50, max: 3000 }).withMessage('Bio must be between 50 and 3000 characters'),

  body('shortBio').optional().trim().isLength({ max: 300 }),

  body('totalExperience')
    .notEmpty().withMessage('Total experience is required')
    .isInt({ min: 0, max: 60 }).withMessage('Experience must be between 0 and 60 years'),

  body('expertise')
    .notEmpty().withMessage('At least one expertise area is required')
    .isArray({ min: 1, max: 15 }).withMessage('Please provide 1-15 expertise areas'),

  body('expertise.*.area')
    .notEmpty().withMessage('Expertise area name is required')
    .trim().isLength({ min: 2, max: 100 }),

  body('expertise.*.yearsOfExperience').optional().isInt({ min: 0, max: 50 }),

  body('expertise.*.proficiencyLevel')
    .optional().isIn(['intermediate', 'advanced', 'expert']),

  body('expertiseCategories')
    .notEmpty().withMessage('At least one expertise category is required')
    .isArray({ min: 1, max: 10 }),

  body('expertiseCategories.*').isIn([
    'Tailoring & Fashion', 'Handicrafts & Artisan', 'Food & Catering',
    'Beauty & Wellness', 'Repair & Maintenance', 'Digital & IT Skills',
    'Photography & Videography', 'Tutoring & Education', 'Gardening & Agriculture',
    'Fitness & Sports', 'Music & Entertainment', 'Writing & Content',
    'Translation & Languages', 'Business Strategy', 'Marketing', 'Finance',
    'Legal', 'Operations', 'Other',
  ]).withMessage('Invalid expertise category'),

  body('skills').optional().isArray({ max: 30 }),
  body('skills.*').optional().isMongoId().withMessage('Invalid skill ID'),

  body('industries').optional().isArray({ max: 10 }),
  body('specializations').optional().isArray({ max: 15 }),

  // Work Experience
  body('workExperience').optional().isArray({ max: 20 }),
  body('workExperience.*.company').notEmpty().trim(),
  body('workExperience.*.position').notEmpty().trim(),
  body('workExperience.*.startDate').isISO8601(),
  body('workExperience.*.endDate').optional({ nullable: true }).isISO8601(),
  body('workExperience.*.isCurrent').optional().isBoolean(),

  // Education
  body('education').optional().isArray({ max: 10 }),
  body('education.*.degree').notEmpty().trim(),
  body('education.*.institution').notEmpty().trim(),
  body('education.*.yearOfCompletion')
    .optional()
    .isInt({ min: 1950, max: new Date().getFullYear() + 10 }),

  // Certifications
  body('certifications').optional().isArray({ max: 20 }),
  body('certifications.*.name').notEmpty().trim(),
  body('certifications.*.issuingOrganization').notEmpty().trim(),

  // Mentorship Preferences
  body('mentorshipTypes')
    .notEmpty().withMessage('Select at least one mentorship type')
    .isArray({ min: 1 }),

  body('mentorshipTypes.*').isIn([
    'one_on_one', 'group_session', 'workshop', 'q_and_a',
    'code_review', 'business_review', 'strategy_session', 'ongoing_mentorship',
  ]),

  body('mentorshipMode')
    .notEmpty().isArray({ min: 1 }).withMessage('Select at least one mode'),
  body('mentorshipMode.*').isIn(['online', 'in_person', 'hybrid']),

  body('mentorshipStyle').optional().isIn(['coaching', 'consulting', 'teaching', 'advising', 'mixed']),

  body('preferredMenteeLevel').optional().isArray(),
  body('preferredMenteeLevel.*').optional().isIn(['beginner', 'intermediate', 'advanced', 'all_levels']),

  // Availability
  body('availability.isAvailable').optional().isBoolean(),
  body('availability.timezone').optional().trim(),
  body('availability.workingDays').optional().isArray(),
  body('availability.workingDays.*.day')
    .optional()
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),

  body('availability.maxSessionsPerWeek').optional().isInt({ min: 1, max: 50 }),

  // Pricing
  body('pricing.isFree').optional().isBoolean(),

  body('pricing.sessionRates').optional().isArray({ max: 10 }),
  body('pricing.sessionRates.*.duration').notEmpty().isInt({ min: 15 }),
  body('pricing.sessionRates.*.price').notEmpty().isFloat({ min: 0 }),
  body('pricing.sessionRates.*.type').optional().isIn(['individual', 'group', 'workshop']),

  body('pricing.firstSessionFree').optional().isBoolean(),
  body('pricing.trialSessionDuration').optional().isInt({ min: 5, max: 60 }),

  // Languages
  body('languages').notEmpty().isArray({ min: 1 }).withMessage('At least one language required'),
  body('languages.*.language').notEmpty().trim(),
  body('languages.*.proficiency').optional().isIn(['basic', 'conversational', 'fluent', 'native']),

  // Location
  body('location.country').optional().trim(),
  body('location.state').optional().trim(),
  body('location.city').optional().trim(),
  body('location.isRemote').optional().isBoolean(),
  body('location.willingToTravel').optional().isBoolean(),

  // Social Links
  body('socialLinks.linkedin').optional({ checkFalsy: true }).isURL(),
  body('socialLinks.twitter').optional({ checkFalsy: true }).isURL(),
  body('socialLinks.website').optional({ checkFalsy: true }).isURL(),

  handleValidationErrors,
];

// ============================================
// UPDATE MENTOR PROFILE VALIDATION
// ============================================
exports.updateMentorProfileValidation = [
  body('title').optional().trim().isLength({ min: 3, max: 150 }),
  body('tagline').optional().trim().isLength({ max: 200 }),
  body('professionalBio').optional().trim().isLength({ min: 50, max: 3000 }),
  body('shortBio').optional().trim().isLength({ max: 300 }),
  body('totalExperience').optional().isInt({ min: 0, max: 60 }),

  body('availability.isAvailable').optional().isBoolean(),
  body('availability.maxSessionsPerWeek').optional().isInt({ min: 1, max: 50 }),

  handleValidationErrors,
];

// ============================================
// MENTOR ID PARAM VALIDATION
// ============================================
exports.mentorIdValidation = [
  param('id')
    .notEmpty().withMessage('Mentor ID is required')
    .isMongoId().withMessage('Invalid mentor ID format'),

  handleValidationErrors,
];

// ============================================
// SEARCH MENTORS VALIDATION
// ============================================
exports.searchMentorsValidation = [
  query('q').optional().trim().isLength({ max: 100 }),

  query('category').optional().trim(),
  query('expertise').optional().trim(),

  query('minRating').optional().isFloat({ min: 0, max: 5 }).toFloat(),
  query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),

  query('mode').optional().isIn(['online', 'in_person', 'hybrid']),

  query('language').optional().trim(),
  query('country').optional().trim(),
  query('city').optional().trim(),

  query('mentorLevel').optional().isIn(['new', 'associate', 'senior', 'expert', 'master']),

  query('isTopMentor').optional().isBoolean().toBoolean(),
  query('isFeatured').optional().isBoolean().toBoolean(),
  query('isAvailable').optional().isBoolean().toBoolean(),

  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),

  query('sortBy')
    .optional()
    .isIn(['rating', 'experience', 'sessions', 'price', 'newest'])
    .withMessage('Invalid sort field'),

  query('sortOrder').optional().isIn(['asc', 'desc']),

  handleValidationErrors,
];

// ============================================
// BOOK SESSION VALIDATION
// ============================================
exports.bookSessionValidation = [
  body('mentor')
    .notEmpty().withMessage('Mentor ID is required')
    .isMongoId().withMessage('Invalid mentor ID'),

  body('title')
    .trim().notEmpty().withMessage('Session title is required')
    .isLength({ min: 5, max: 200 }),

  body('description').optional().trim().isLength({ max: 2000 }),

  body('sessionType')
    .notEmpty().withMessage('Session type is required')
    .isIn([
      'one_on_one', 'group_session', 'workshop', 'q_and_a', 'code_review',
      'business_review', 'strategy_session', 'consultation', 'follow_up', 'trial_session',
    ]),

  body('mode')
    .notEmpty().withMessage('Session mode is required')
    .isIn(['online', 'in_person', 'phone']),

  body('scheduledDate')
    .notEmpty().withMessage('Scheduled date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    }),

  body('startTime')
    .notEmpty().withMessage('Start time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid time format (HH:mm)'),

  body('endTime')
    .notEmpty().withMessage('End time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid time format (HH:mm)'),

  body('duration')
    .notEmpty().withMessage('Duration is required')
    .isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),

  body('timezone').optional().trim(),

  body('relatedBusinessIdea').optional().isMongoId(),
  body('relatedRoadmap').optional().isMongoId(),

  body('topics').optional().isArray({ max: 10 }),

  body('menteeGoals.primaryGoal').optional().trim().isLength({ max: 500 }),
  body('menteeGoals.specificQuestions').optional().isArray({ max: 10 }),
  body('menteeGoals.currentChallenges').optional().trim().isLength({ max: 1000 }),

  handleValidationErrors,
];

// ============================================
// CANCEL SESSION VALIDATION
// ============================================
exports.cancelSessionValidation = [
  param('id').notEmpty().isMongoId().withMessage('Invalid session ID'),

  body('reason')
    .notEmpty().withMessage('Cancellation reason is required')
    .isIn([
      'schedule_conflict', 'personal_emergency', 'not_interested',
      'found_alternative', 'technical_issues', 'mentor_unavailable', 'other',
    ]),

  body('description').optional().trim().isLength({ max: 500 }),

  handleValidationErrors,
];

// ============================================
// RESCHEDULE SESSION VALIDATION
// ============================================
exports.rescheduleSessionValidation = [
  param('id').notEmpty().isMongoId().withMessage('Invalid session ID'),

  body('newDate')
    .notEmpty().withMessage('New date is required')
    .isISO8601()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('New date must be in the future');
      }
      return true;
    }),

  body('newStartTime').notEmpty().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('newEndTime').notEmpty().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),

  body('reason').notEmpty().trim().isLength({ min: 5, max: 500 }),

  handleValidationErrors,
];

// ============================================
// REVIEW SESSION VALIDATION
// ============================================
exports.reviewSessionValidation = [
  param('id').notEmpty().isMongoId().withMessage('Invalid session ID'),

  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }),

  body('title').optional().trim().isLength({ max: 200 }),
  body('comment').optional().trim().isLength({ max: 1000 }),

  body('aspects.communication').optional().isInt({ min: 1, max: 5 }),
  body('aspects.knowledge').optional().isInt({ min: 1, max: 5 }),
  body('aspects.helpfulness').optional().isInt({ min: 1, max: 5 }),
  body('aspects.professionalism').optional().isInt({ min: 1, max: 5 }),
  body('aspects.valueForMoney').optional().isInt({ min: 1, max: 5 }),

  body('wouldRecommend').optional().isBoolean(),
  body('wouldBookAgain').optional().isBoolean(),

  handleValidationErrors,
];

// ============================================
// UPDATE AVAILABILITY VALIDATION
// ============================================
exports.updateAvailabilityValidation = [
  body('workingDays').isArray(),
  body('workingDays.*.day').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  body('workingDays.*.slots').isArray(),
  body('workingDays.*.slots.*.startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  body('workingDays.*.slots.*.endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/),

  body('timezone').optional().trim(),
  body('maxSessionsPerWeek').optional().isInt({ min: 1, max: 50 }),

  body('vacationMode.isOn').optional().isBoolean(),
  body('vacationMode.startDate').optional().isISO8601(),
  body('vacationMode.endDate').optional().isISO8601(),

  handleValidationErrors,
];

// ============================================
// VERIFY MENTOR VALIDATION (Admin)
// ============================================
exports.verifyMentorValidation = [
  param('id').notEmpty().isMongoId(),

  body('status')
    .notEmpty().withMessage('Verification status is required')
    .isIn(['verified', 'rejected']),

  body('rejectionReason')
    .if(body('status').equals('rejected'))
    .notEmpty().withMessage('Rejection reason is required')
    .trim().isLength({ min: 10, max: 500 }),

  handleValidationErrors,
];