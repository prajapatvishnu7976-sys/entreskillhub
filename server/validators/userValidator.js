// ============================================
// EntreSkillHub - User Profile Validators
// ============================================

const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('./authValidator');

// ============================================
// UPDATE PROFILE VALIDATION
// ============================================
exports.updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),

  body('dateOfBirth')
    .optional({ nullable: true })
    .custom((value) => {
      if (!value || value === '') return true;
      const date = new Date(value);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      const age = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 13 || age > 120) throw new Error('Age must be between 13 and 120 years');
      return true;
    }),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Invalid gender value'),

  body('location.country').optional().trim(),
  body('location.state').optional().trim(),
  body('location.city').optional().trim(),

  body('location.pincode')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value || value === '') return true;
      if (!/^\d{4,10}$/.test(value)) throw new Error('Please provide a valid pincode');
      return true;
    }),

  body('location.address')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Address cannot exceed 200 characters'),

  body('education.level')
    .optional()
    .isIn([
      'no_formal_education', 'primary', 'secondary', 'higher_secondary',
      'diploma', 'undergraduate', 'postgraduate', 'doctorate', 'other',
    ]).withMessage('Invalid education level'),

  body('education.field').optional().trim(),
  body('education.institution').optional().trim(),

  body('occupation.current').optional().trim(),
  body('occupation.experience')
    .optional()
    .custom((value) => {
      if (value === '' || value === undefined || value === null) return true;
      const num = parseInt(value);
      if (isNaN(num) || num < 0 || num > 60) throw new Error('Experience must be between 0 and 60');
      return true;
    }),
  body('occupation.industry').optional().trim(),

  body('entrepreneurshipStage')
    .optional()
    .isIn(['exploring', 'planning', 'starting', 'operating', 'scaling'])
    .withMessage('Invalid entrepreneurship stage'),

  body('interests')
    .optional()
    .isArray({ max: 20 }).withMessage('Maximum 20 interests allowed'),

  body('interests.*')
    .optional()
    .trim(),

  // Social links - accept any string, no strict URL validation
  body('socialLinks.linkedin').optional({ nullable: true, checkFalsy: true }),
  body('socialLinks.twitter').optional({ nullable: true, checkFalsy: true }),
  body('socialLinks.facebook').optional({ nullable: true, checkFalsy: true }),
  body('socialLinks.instagram').optional({ nullable: true, checkFalsy: true }),
  body('socialLinks.website').optional({ nullable: true, checkFalsy: true }),

  handleValidationErrors,
];

// ============================================
// UPDATE PREFERENCES VALIDATION
// ============================================
exports.updatePreferencesValidation = [
  body('language').optional(),
  body('theme').optional().isIn(['light', 'dark', 'auto']).withMessage('Invalid theme'),
  body('currency').optional(),
  body('notificationPreferences.email').optional().isBoolean(),
  body('notificationPreferences.sms').optional().isBoolean(),
  body('notificationPreferences.inApp').optional().isBoolean(),
  body('notificationPreferences.marketing').optional().isBoolean(),

  handleValidationErrors,
];

// ============================================
// ADD/UPDATE SKILLS VALIDATION
// ============================================
exports.addSkillsValidation = [
  body('skills')
    .notEmpty().withMessage('Skills array is required')
    .isArray({ min: 1, max: 20 }).withMessage('Please provide between 1 and 20 skills'),

  body('skills.*.skill')
    .notEmpty().withMessage('Skill ID is required')
    .isMongoId().withMessage('Invalid skill ID'),

  body('skills.*.proficiency')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid proficiency level'),

  body('skills.*.yearsOfExperience')
    .optional()
    .custom((value) => {
      if (value === '' || value === undefined || value === null) return true;
      const num = parseInt(value);
      if (isNaN(num) || num < 0 || num > 50) throw new Error('Years must be between 0 and 50');
      return true;
    }),

  handleValidationErrors,
];

// ============================================
// USER ID PARAM VALIDATION
// ============================================
exports.userIdValidation = [
  param('userId')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID format'),

  handleValidationErrors,
];

// ============================================
// SEARCH USERS VALIDATION
// ============================================
exports.searchUsersValidation = [
  query('q').optional().trim(),
  query('role').optional().isIn(['user', 'mentor', 'admin']).withMessage('Invalid role filter'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('sortBy').optional(),
  query('sortOrder').optional().isIn(['asc', 'desc']),

  handleValidationErrors,
];

// ============================================
// DELETE ACCOUNT VALIDATION
// ============================================
exports.deleteAccountValidation = [
  body('password')
    .notEmpty().withMessage('Password is required for account deletion'),

  body('reason').optional().trim(),

  handleValidationErrors,
];

// ============================================
// UPDATE ACCOUNT STATUS VALIDATION (Admin)
// ============================================
exports.updateAccountStatusValidation = [
  param('userId')
    .notEmpty().isMongoId().withMessage('Invalid user ID'),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),

  body('reason').optional().trim(),

  handleValidationErrors,
];

// ============================================
// BAN/UNBAN USER VALIDATION (Admin)
// ============================================
exports.banUserValidation = [
  param('userId')
    .notEmpty().isMongoId().withMessage('Invalid user ID'),

  body('isBanned').notEmpty().isBoolean().withMessage('isBanned must be a boolean'),

  body('reason').optional().trim(),

  handleValidationErrors,
];