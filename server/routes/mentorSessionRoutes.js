// ============================================
// EntreSkillHub - Mentor Session Routes
// ============================================

const express = require('express');
const router = express.Router();

const sessionController = require('../controllers/mentorSessionController');
const { protect, requireMentor } = require('../middleware/auth');
const { bookingLimiter, apiLimiter } = require('../middleware/rateLimiter');
const {
  bookSessionValidation,
  cancelSessionValidation,
  rescheduleSessionValidation,
  reviewSessionValidation,
} = require('../validators/mentorValidator');

// All session routes require authentication
router.use(protect);

// ============================================
// Booking & Management
// ============================================

router.post('/book', bookingLimiter, bookSessionValidation, sessionController.bookSession);

// Get sessions
router.get('/upcoming', sessionController.getUpcomingSessions);
router.get('/past', sessionController.getPastSessions);
router.get('/my', sessionController.getMySessions);
router.get('/mentor/schedule', requireMentor, sessionController.getMentorSchedule);

// ============================================
// Session Actions
// ============================================

// Confirm (Mentor)
router.put('/:id/confirm', sessionController.confirmSession);

// Cancel
router.put('/:id/cancel', cancelSessionValidation, sessionController.cancelSession);

// Reschedule
router.put('/:id/reschedule', rescheduleSessionValidation, sessionController.rescheduleSession);

// Start
router.put('/:id/start', sessionController.startSession);

// Complete (Mentor)
router.put('/:id/complete', sessionController.completeSession);

// ============================================
// Session Content
// ============================================

// Notes
router.put('/:id/notes', sessionController.addSessionNotes);

// Action items
router.post('/:id/action-items', sessionController.addActionItem);

// Messages
router.post('/:id/messages', sessionController.sendMessage);

// ============================================
// Reviews
// ============================================

router.post('/:id/review/mentee', reviewSessionValidation, sessionController.submitMenteeReview);
router.post('/:id/review/mentor', reviewSessionValidation, sessionController.submitMentorReview);

// ============================================
// Get session details (must be last)
// ============================================

router.get('/:id', sessionController.getSessionById);

module.exports = router;