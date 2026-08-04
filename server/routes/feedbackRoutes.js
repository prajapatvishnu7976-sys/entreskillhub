// ============================================
// EntreSkillHub - Feedback Routes
// ============================================

const express = require('express');
const router = express.Router();

const feedbackController = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');
const { feedbackLimiter, apiLimiter } = require('../middleware/rateLimiter');
const { memoryUpload } = require('../middleware/upload');
const { createFeedbackValidation } = require('../validators/businessValidator');

// ============================================
// Public Routes
// ============================================

router.get('/testimonials', apiLimiter, feedbackController.getTestimonials);
router.get('/feature-requests', apiLimiter, feedbackController.getFeatureRequests);

// ============================================
// User Routes (Authenticated)
// ============================================

router.post(
  '/',
  protect,
  feedbackLimiter,
  memoryUpload.array('attachments', 3),
  createFeedbackValidation,
  feedbackController.submitFeedback
);

router.get('/my', protect, feedbackController.getMyFeedback);
router.post('/:id/vote', protect, feedbackController.voteOnFeedback);
router.post('/:id/satisfaction', protect, feedbackController.submitSatisfaction);

// ============================================
// Admin Routes
// ============================================

router.get('/', protect, adminOnly, feedbackController.getAllFeedback);
router.get('/pending', protect, adminOnly, feedbackController.getPendingFeedback);
router.get('/overdue', protect, adminOnly, feedbackController.getOverdueFeedback);
router.get('/stats', protect, adminOnly, feedbackController.getFeedbackStats);

router.put('/:id/assign', protect, adminOnly, feedbackController.assignFeedback);
router.post('/:id/respond', protect, adminOnly, feedbackController.respondToFeedback);
router.put('/:id/resolve', protect, adminOnly, feedbackController.resolveFeedback);
router.put('/:id/status', protect, adminOnly, feedbackController.updateFeedbackStatus);
router.post('/:id/internal-note', protect, adminOnly, feedbackController.addInternalNote);
router.put('/:id/mark-duplicate', protect, adminOnly, feedbackController.markAsDuplicate);
router.put('/:id/feature-testimonial', protect, adminOnly, feedbackController.featureTestimonial);
router.delete('/:id', protect, adminOnly, feedbackController.deleteFeedback);

// ============================================
// Dynamic Route (must be last)
// ============================================

router.get('/:id', protect, feedbackController.getFeedbackById);

module.exports = router;