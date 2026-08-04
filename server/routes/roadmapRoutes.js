// ============================================
// EntreSkillHub - Roadmap Routes
// ============================================

const express = require('express');
const router = express.Router();

const roadmapController = require('../controllers/roadmapController');
const { protect, optionalAuth } = require('../middleware/auth');
const { adminOnly, mentorOrAdmin } = require('../middleware/roleCheck');
const { uploadResourceImageMiddleware } = require('../middleware/upload');
const { apiLimiter, searchLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const { createRoadmapValidation } = require('../validators/businessValidator');

// ============================================
// Public Routes
// ============================================

router.get('/', searchLimiter, roadmapController.getAllRoadmaps);
router.get('/featured', apiLimiter, roadmapController.getFeaturedRoadmaps);
router.get('/popular', apiLimiter, roadmapController.getPopularRoadmaps);
router.get('/business/:businessId', apiLimiter, roadmapController.getRoadmapByBusiness);

// ============================================
// Private Routes - User Actions
// ============================================

router.get('/my/roadmaps', protect, roadmapController.getMyRoadmaps);
router.post('/:id/enroll', protect, roadmapController.enrollInRoadmap);
router.post('/:id/rate', protect, roadmapController.rateRoadmap);

// Step-related routes
router.get('/:id/steps/:stepNumber', protect, roadmapController.getRoadmapStep);
router.put('/:id/steps/:stepNumber/progress', protect, roadmapController.updateStepProgress);
router.post('/:id/steps/:stepNumber/tasks/:taskId/complete', protect, roadmapController.completeTask);

// ============================================
// Admin/Mentor Routes
// ============================================

router.post(
  '/',
  protect,
  mentorOrAdmin,
  uploadLimiter,
  uploadResourceImageMiddleware,
  createRoadmapValidation,
  roadmapController.createRoadmap
);

router.put(
  '/:id',
  protect,
  mentorOrAdmin,
  uploadResourceImageMiddleware,
  roadmapController.updateRoadmap
);

router.delete('/:id', protect, adminOnly, roadmapController.deleteRoadmap);

// ============================================
// Dynamic Route (must be last)
// ============================================

router.get('/:identifier', optionalAuth, roadmapController.getRoadmapById);

module.exports = router;