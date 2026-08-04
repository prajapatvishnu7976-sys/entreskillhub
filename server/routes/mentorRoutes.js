// ============================================
// EntreSkillHub - Mentor Routes
// ============================================

const express = require('express');
const router = express.Router();

const mentorController = require('../controllers/mentorController');
const { protect, optionalAuth, requireMentor } = require('../middleware/auth');
const { adminOnly, verifiedMentorOnly } = require('../middleware/roleCheck');
const { uploadMentorDocsMiddleware } = require('../middleware/upload');
const { apiLimiter, searchLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const {
  mentorRegistrationValidation,
  updateMentorProfileValidation,
  mentorIdValidation,
  searchMentorsValidation,
  updateAvailabilityValidation,
  verifyMentorValidation,
} = require('../validators/mentorValidator');

// ============================================
// Public Routes
// ============================================

router.get('/', searchLimiter, searchMentorsValidation, mentorController.getAllMentors);
router.get('/top', apiLimiter, mentorController.getTopMentors);
router.get('/featured', apiLimiter, mentorController.getFeaturedMentors);
router.get('/category/:category', apiLimiter, mentorController.getMentorsByCategory);

// ============================================
// Private Routes - Mentor Actions
// ============================================

// Registration
router.post(
  '/register',
  protect,
  mentorRegistrationValidation,
  mentorController.registerAsMentor
);

// Own profile management
router.get('/profile/me', protect, requireMentor, mentorController.getMyMentorProfile);
router.put(
  '/profile',
  protect,
  requireMentor,
  updateMentorProfileValidation,
  mentorController.updateMentorProfile
);
router.delete('/profile', protect, requireMentor, mentorController.deleteMentorProfile);

// Availability
router.put(
  '/availability',
  protect,
  requireMentor,
  updateAvailabilityValidation,
  mentorController.updateAvailability
);

// Verification documents
router.post(
  '/verification/documents',
  protect,
  requireMentor,
  uploadLimiter,
  uploadMentorDocsMiddleware,
  mentorController.uploadVerificationDocuments
);

// Stats and mentees
router.get('/stats/me', protect, requireMentor, mentorController.getMyMentorStats);
router.get('/mentees/me', protect, requireMentor, mentorController.getMyMentees);

// Answer questions
router.post('/questions/:questionId/answer', protect, requireMentor, mentorController.answerQuestion);

// ============================================
// Private Routes - User Actions
// ============================================

router.post('/:id/ask', protect, mentorController.askMentorQuestion);
router.get('/:id/questions', mentorController.getMentorQuestions);

// ============================================
// Admin Routes
// ============================================

router.get('/admin/pending', protect, adminOnly, mentorController.getPendingMentors);
router.put('/:id/verify', protect, adminOnly, verifyMentorValidation, mentorController.verifyMentor);

// ============================================
// Dynamic Route (must be last)
// ============================================

router.get('/:identifier', optionalAuth, mentorController.getMentorById);

module.exports = router;