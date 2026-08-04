// ============================================
// EntreSkillHub - Business Idea Routes
// ============================================

const express = require('express');
const router = express.Router();

const businessIdeaController = require('../controllers/businessIdeaController');
const { protect, optionalAuth } = require('../middleware/auth');
const { adminOnly, mentorOrAdmin } = require('../middleware/roleCheck');
const { uploadBusinessFullMiddleware } = require('../middleware/upload');
const { apiLimiter, searchLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const {
  createBusinessIdeaValidation,
  updateBusinessIdeaValidation,
  businessIdParamValidation,
  searchBusinessValidation,
  rateBusinessValidation,
  getRecommendationsValidation,
} = require('../validators/businessValidator');

// ============================================
// Public Routes
// ============================================

router.get('/', searchLimiter, searchBusinessValidation, businessIdeaController.getAllBusinessIdeas);
router.get('/featured', apiLimiter, businessIdeaController.getFeaturedBusinesses);
router.get('/trending', apiLimiter, businessIdeaController.getTrendingBusinesses);
router.get('/categories', apiLimiter, businessIdeaController.getBusinessCategories);
router.get('/investment-range', apiLimiter, businessIdeaController.getByInvestmentRange);
router.get('/category/:category', apiLimiter, businessIdeaController.getBusinessIdeasByCategory);

// ============================================
// Private Routes
// ============================================

router.get(
  '/recommendations',
  protect,
  getRecommendationsValidation,
  businessIdeaController.getRecommendedBusinesses
);

router.post(
  '/:id/rate',
  protect,
  rateBusinessValidation,
  businessIdeaController.rateBusinessIdea
);

router.post('/:id/share', optionalAuth, businessIdeaController.shareBusinessIdea);

// ============================================
// Admin/Mentor Routes
// ============================================

router.post(
  '/',
  protect,
  mentorOrAdmin,
  uploadLimiter,
  uploadBusinessFullMiddleware,
  createBusinessIdeaValidation,
  businessIdeaController.createBusinessIdea
);

router.put(
  '/:id',
  protect,
  mentorOrAdmin,
  uploadBusinessFullMiddleware,
  updateBusinessIdeaValidation,
  businessIdeaController.updateBusinessIdea
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  businessIdParamValidation,
  businessIdeaController.deleteBusinessIdea
);

// ============================================
// Admin Only Routes
// ============================================

router.get('/admin/pending', protect, adminOnly, businessIdeaController.getPendingBusinesses);
router.put('/:id/review', protect, adminOnly, businessIdeaController.reviewBusinessIdea);

// ============================================
// Dynamic Routes (must be last)
// ============================================

router.get('/:id/similar', apiLimiter, businessIdeaController.getSimilarBusinessIdeas);
router.get('/:identifier', optionalAuth, businessIdeaController.getBusinessIdeaById);

module.exports = router;