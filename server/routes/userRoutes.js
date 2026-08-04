// ============================================
// EntreSkillHub - User Routes
// ============================================

const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');
const { adminOnly, superAdminOnly } = require('../middleware/roleCheck');
const { uploadProfileImageMiddleware } = require('../middleware/upload');
const { apiLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const {
  updateProfileValidation,
  updatePreferencesValidation,
  addSkillsValidation,
  userIdValidation,
  searchUsersValidation,
  deleteAccountValidation,
} = require('../validators/userValidator');

// ============================================
// Public Routes
// ============================================
router.get('/search', apiLimiter, searchUsersValidation, userController.searchUsers);

// ============================================
// Private Routes
// ============================================

// Profile management
router.put('/profile', protect, updateProfileValidation, userController.updateProfile);
router.put(
  '/profile/image',
  protect,
  uploadLimiter,
  uploadProfileImageMiddleware,
  userController.uploadProfileImage
);
router.delete('/profile/image', protect, userController.deleteProfileImage);

// Preferences
router.put(
  '/preferences',
  protect,
  updatePreferencesValidation,
  userController.updatePreferences
);

// Skills management
router.post('/skills', protect, addSkillsValidation, userController.addUserSkills);
router.delete('/skills/:skillId', protect, userController.removeUserSkill);

// Interests
router.put('/interests', protect, userController.updateInterests);

// Saved businesses
router.get('/saved-businesses', protect, userController.getSavedBusinesses);
router.post('/save-business/:businessId', protect, userController.toggleSaveBusiness);

// Dashboard & stats
router.get('/dashboard-stats', protect, userController.getDashboardStats);
router.get('/activity', protect, userController.getActivityFeed);
router.get('/login-history', protect, userController.getLoginHistory);
router.get('/referral', protect, userController.getReferralInfo);

// Account management
router.delete('/account', protect, deleteAccountValidation, userController.deleteAccount);

// Public profile (must be last to avoid conflicts)
router.get('/:userId', optionalAuth, userIdValidation, userController.getUserProfile);

module.exports = router;