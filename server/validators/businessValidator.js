// ============================================
// EntreSkillHub - Business Idea Validators
// ============================================

const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('./authValidator');

// ============================================
// CREATE BUSINESS IDEA VALIDATION
// ============================================
exports.createBusinessIdeaValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 150 }).withMessage('Title must be between 5 and 150 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 50, max: 5000 }).withMessage('Description must be between 50 and 5000 characters'),

  body('shortDescription').optional().trim().isLength({ max: 300 }),

  body('tagline').optional().trim().isLength({ max: 200 }),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn([
      'Home-Based Business', 'Service Business', 'Product Business', 'Online Business',
      'Food Business', 'Retail Business', 'Creative Business', 'Technical Service',
      'Educational Service', 'Health & Wellness', 'Event Management', 'Consulting',
      'Freelancing', 'E-commerce', 'Social Enterprise',
    ]).withMessage('Invalid category'),

  body('subCategory').optional().trim().isLength({ max: 100 }),

  body('industry').optional().trim().isLength({ max: 100 }),

  body('tags')
    .optional()
    .isArray({ max: 20 }).withMessage('Maximum 20 tags allowed'),

  body('tags.*').optional().trim().isLength({ min: 1, max: 30 }),

  // Required Skills
  body('requiredSkills')
    .optional()
    .isArray({ max: 15 }).withMessage('Maximum 15 required skills'),

  body('requiredSkills.*.skill')
    .optional().isMongoId().withMessage('Invalid skill ID'),

  body('requiredSkills.*.importance')
    .optional().isIn(['essential', 'important', 'good_to_have']),

  body('requiredSkills.*.minimumLevel')
    .optional().isIn(['beginner', 'intermediate', 'advanced']),

  // Investment
  body('investment.minimum')
    .notEmpty().withMessage('Minimum investment is required')
    .isFloat({ min: 0 }).withMessage('Minimum investment must be a positive number'),

  body('investment.maximum')
    .notEmpty().withMessage('Maximum investment is required')
    .isFloat({ min: 0 }).withMessage('Maximum investment must be a positive number')
    .custom((value, { req }) => {
      if (parseFloat(value) < parseFloat(req.body.investment.minimum)) {
        throw new Error('Maximum investment must be greater than or equal to minimum');
      }
      return true;
    }),

  body('investment.currency').optional().isLength({ min: 3, max: 3 }),

  body('investment.breakdown').optional().isArray(),
  body('investment.breakdown.*.item').optional().trim().notEmpty(),
  body('investment.breakdown.*.cost').optional().isFloat({ min: 0 }),

  // Revenue
  body('revenue.monthly.min').optional().isFloat({ min: 0 }),
  body('revenue.monthly.max').optional().isFloat({ min: 0 }),
  body('revenue.monthly.realistic').optional().isFloat({ min: 0 }),
  body('revenue.profitMargin').optional().isFloat({ min: 0, max: 100 }),
  body('revenue.breakEvenTime.months').optional().isInt({ min: 0 }),

  // Difficulty
  body('difficulty')
    .optional()
    .isIn(['very_easy', 'easy', 'medium', 'hard', 'very_hard']).withMessage('Invalid difficulty'),

  // Complexity
  body('complexity.technical').optional().isIn(['none', 'low', 'medium', 'high']),
  body('complexity.operational').optional().isIn(['simple', 'moderate', 'complex']),
  body('complexity.legal').optional().isIn(['minimal', 'moderate', 'extensive']),

  // Time
  body('timeToStart.duration').optional().isInt({ min: 1 }),
  body('timeToStart.unit').optional().isIn(['days', 'weeks', 'months']),

  body('timeCommitment.hoursPerDay.min').optional().isInt({ min: 1, max: 24 }),
  body('timeCommitment.hoursPerDay.max').optional().isInt({ min: 1, max: 24 }),
  body('timeCommitment.canBePartTime').optional().isBoolean(),

  // Target Market
  body('targetMarket.primaryAudience').optional().trim().isLength({ max: 200 }),
  body('targetMarket.geography')
    .optional()
    .isIn(['hyperlocal', 'local', 'city', 'state', 'national', 'international']),
  body('targetMarket.marketSize').optional().isIn(['small', 'medium', 'large', 'very_large']),

  // Location
  body('locationRequirement.type')
    .optional()
    .isIn(['home_based', 'small_shop', 'office_space', 'warehouse', 'online_only', 'mobile', 'field_work']),

  // Equipment
  body('equipment').optional().isArray({ max: 30 }),
  body('equipment.*.name').optional().trim().notEmpty(),
  body('equipment.*.cost').optional().isFloat({ min: 0 }),

  // Success Factors & Challenges
  body('successFactors').optional().isArray({ max: 20 }),
  body('challenges').optional().isArray({ max: 20 }),

  // Scalability
  body('scalability.potential').optional().isIn(['limited', 'moderate', 'high', 'very_high']),
  body('scalability.franchiseOpportunity').optional().isBoolean(),

  handleValidationErrors,
];

// ============================================
// UPDATE BUSINESS IDEA VALIDATION
// ============================================
exports.updateBusinessIdeaValidation = [
  param('id').notEmpty().isMongoId().withMessage('Invalid business idea ID'),

  body('title').optional().trim().isLength({ min: 5, max: 150 }),
  body('description').optional().trim().isLength({ min: 50, max: 5000 }),
  body('shortDescription').optional().trim().isLength({ max: 300 }),
  body('tagline').optional().trim().isLength({ max: 200 }),

  body('category').optional().isIn([
    'Home-Based Business', 'Service Business', 'Product Business', 'Online Business',
    'Food Business', 'Retail Business', 'Creative Business', 'Technical Service',
    'Educational Service', 'Health & Wellness', 'Event Management', 'Consulting',
    'Freelancing', 'E-commerce', 'Social Enterprise',
  ]),

  body('difficulty').optional().isIn(['very_easy', 'easy', 'medium', 'hard', 'very_hard']),

  body('investment.minimum').optional().isFloat({ min: 0 }),
  body('investment.maximum').optional().isFloat({ min: 0 }),

  body('status').optional().isIn(['draft', 'pending_review', 'approved', 'rejected', 'archived']),

  body('isActive').optional().isBoolean(),
  body('isFeatured').optional().isBoolean(),
  body('isTrending').optional().isBoolean(),

  handleValidationErrors,
];

// ============================================
// BUSINESS IDEA ID PARAM VALIDATION
// ============================================
exports.businessIdParamValidation = [
  param('id')
    .notEmpty().withMessage('Business idea ID is required')
    .isMongoId().withMessage('Invalid business idea ID format'),

  handleValidationErrors,
];

// ============================================
// SEARCH/FILTER BUSINESS IDEAS VALIDATION
// ============================================
exports.searchBusinessValidation = [
  query('q').optional().trim().isLength({ max: 100 }),

  query('category').optional().trim(),

  query('difficulty')
    .optional()
    .isIn(['very_easy', 'easy', 'medium', 'hard', 'very_hard']).withMessage('Invalid difficulty'),

  query('minInvestment').optional().isFloat({ min: 0 }).toFloat(),
  query('maxInvestment').optional().isFloat({ min: 0 }).toFloat(),

  query('isBeginnerFriendly').optional().isBoolean().toBoolean(),
  query('isLowInvestment').optional().isBoolean().toBoolean(),
  query('isFeatured').optional().isBoolean().toBoolean(),
  query('isTrending').optional().isBoolean().toBoolean(),

  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'title', 'investment', 'rating', 'popularity', 'viewCount'])
    .withMessage('Invalid sort field'),

  query('sortOrder').optional().isIn(['asc', 'desc']),

  handleValidationErrors,
];

// ============================================
// RATE BUSINESS IDEA VALIDATION
// ============================================
exports.rateBusinessValidation = [
  param('id').notEmpty().isMongoId().withMessage('Invalid business idea ID'),

  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

  body('comment').optional().trim().isLength({ max: 1000 }),

  handleValidationErrors,
];

// ============================================
// GET RECOMMENDATIONS VALIDATION
// ============================================
exports.getRecommendationsValidation = [
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('category').optional().trim(),
  query('minScore').optional().isInt({ min: 0, max: 100 }).toInt(),

  handleValidationErrors,
];

// ============================================
// CREATE ROADMAP VALIDATION
// ============================================
exports.createRoadmapValidation = [
  body('title')
    .trim().notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),

  body('description')
    .trim().notEmpty().withMessage('Description is required')
    .isLength({ min: 50, max: 5000 }),

  body('businessIdea')
    .notEmpty().withMessage('Business idea reference is required')
    .isMongoId().withMessage('Invalid business idea ID'),

  body('category').notEmpty().withMessage('Category is required'),

  body('difficulty').optional().isIn(['very_easy', 'easy', 'medium', 'hard', 'very_hard']),

  body('estimatedDuration.total').optional().isInt({ min: 1 }),
  body('estimatedDuration.unit').optional().isIn(['days', 'weeks', 'months']),

  body('totalInvestment.minimum').optional().isFloat({ min: 0 }),
  body('totalInvestment.maximum').optional().isFloat({ min: 0 }),

  body('steps')
    .notEmpty().withMessage('Steps are required')
    .isArray({ min: 1 }).withMessage('At least one step is required'),

  body('steps.*.stepNumber').notEmpty().isInt({ min: 1 }),
  body('steps.*.title').notEmpty().trim().isLength({ min: 3, max: 200 }),
  body('steps.*.description').notEmpty().trim().isLength({ min: 10, max: 3000 }),
  body('steps.*.phase').notEmpty().isIn([
    'idea_validation', 'planning', 'skill_building', 'legal_setup', 'financial_setup',
    'infrastructure', 'branding', 'marketing', 'launch', 'operations', 'growth', 'scaling',
  ]),

  handleValidationErrors,
];

// ============================================
// CREATE LEARNING RESOURCE VALIDATION
// ============================================
exports.createResourceValidation = [
  body('title')
    .trim().notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }),

  body('description')
    .trim().notEmpty().withMessage('Description is required')
    .isLength({ min: 20, max: 3000 }),

  body('resourceType')
    .notEmpty().withMessage('Resource type is required')
    .isIn([
      'video', 'article', 'checklist', 'guide', 'template', 'tool',
      'course', 'ebook', 'infographic', 'podcast', 'webinar',
      'case_study', 'worksheet', 'quiz',
    ]),

  body('category').notEmpty().withMessage('Category is required'),

  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']),

  body('language').optional().isIn(['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa']),

  body('author.name').notEmpty().trim().isLength({ min: 2, max: 100 }),

  body('access').optional().isIn(['free', 'premium', 'paid', 'members_only']),

  body('price.amount').optional().isFloat({ min: 0 }),

  body('content.videoUrl').optional().isURL(),
  body('content.downloadUrl').optional().isURL(),

  handleValidationErrors,
];

// ============================================
// CREATE FEEDBACK VALIDATION
// ============================================
exports.createFeedbackValidation = [
  body('feedbackType')
    .notEmpty().withMessage('Feedback type is required')
    .isIn([
      'general', 'bug_report', 'feature_request', 'complaint', 'compliment',
      'suggestion', 'question', 'content_feedback', 'mentor_feedback',
      'platform_review', 'testimonial',
    ]),

  body('category').optional(),

  body('subject')
    .trim().notEmpty().withMessage('Subject is required')
    .isLength({ min: 5, max: 200 }),

  body('message')
    .trim().notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 5000 }),

  body('rating.overall').optional().isInt({ min: 1, max: 5 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),

  handleValidationErrors,
];