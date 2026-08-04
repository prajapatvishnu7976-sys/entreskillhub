// ============================================
// EntreSkillHub - Learning Resource Routes
// ============================================

const express = require('express');
const router = express.Router();

const resourceController = require('../controllers/resourceController');
const { protect, optionalAuth } = require('../middleware/auth');
const { adminOnly, mentorOrAdmin } = require('../middleware/roleCheck');
const { uploadResourceImageMiddleware } = require('../middleware/upload');
const { apiLimiter, searchLimiter, uploadLimiter, commentLimiter } = require('../middleware/rateLimiter');
const { createResourceValidation } = require('../validators/businessValidator');

// ============================================
// Public Routes
// ============================================

router.get('/', searchLimiter, resourceController.getAllResources);
router.get('/featured', apiLimiter, resourceController.getFeaturedResources);
router.get('/trending', apiLimiter, resourceController.getTrendingResources);
router.get('/free', apiLimiter, resourceController.getFreeResources);
router.get('/type/:type', apiLimiter, resourceController.getResourcesByType);
router.get('/category/:category', apiLimiter, resourceController.getResourcesByCategory);

// ============================================
// Private Routes
// ============================================

router.post('/:id/review', protect, resourceController.reviewResource);
router.post('/:id/comment', protect, commentLimiter, resourceController.addComment);
router.post('/:id/complete', protect, resourceController.markCompleted);
router.post('/:id/report', protect, resourceController.reportResource);

// ============================================
// Admin/Mentor Routes
// ============================================

router.post(
  '/',
  protect,
  mentorOrAdmin,
  uploadLimiter,
  uploadResourceImageMiddleware,
  createResourceValidation,
  resourceController.createResource
);

router.put(
  '/:id',
  protect,
  mentorOrAdmin,
  uploadResourceImageMiddleware,
  resourceController.updateResource
);

router.delete('/:id', protect, mentorOrAdmin, resourceController.deleteResource);

// ============================================
// Admin Only Routes
// ============================================

router.get('/admin/pending', protect, adminOnly, resourceController.getPendingResources);
router.put('/:id/review-status', protect, adminOnly, resourceController.reviewResourceStatus);

// ============================================
// Dynamic Route (must be last)
// ============================================

router.get('/:identifier', optionalAuth, resourceController.getResourceById);

module.exports = router;