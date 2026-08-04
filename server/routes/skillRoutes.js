// ============================================
// EntreSkillHub - Skill Routes
// ============================================

const express = require('express');
const router = express.Router();

const skillController = require('../controllers/skillController');
const { protect, optionalAuth } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');
const { apiLimiter, searchLimiter } = require('../middleware/rateLimiter');

// ============================================
// Public Routes
// ============================================

router.get('/', searchLimiter, skillController.getAllSkills);
router.get('/featured', apiLimiter, skillController.getFeaturedSkills);
router.get('/trending', apiLimiter, skillController.getTrendingSkills);
router.get('/categories', apiLimiter, skillController.getSkillCategories);
router.get('/stats', apiLimiter, skillController.getSkillStats);
router.get('/category/:category', apiLimiter, skillController.getSkillsByCategory);

// ============================================
// Private Routes
// ============================================

router.get('/recommendations', protect, skillController.getSkillRecommendations);
router.post('/:id/rate', protect, skillController.rateSkill);

// ============================================
// Admin Only Routes
// ============================================

router.post('/', protect, adminOnly, skillController.createSkill);
router.put('/:id', protect, adminOnly, skillController.updateSkill);
router.delete('/:id', protect, adminOnly, skillController.deleteSkill);

// Get single skill (must be last)
router.get('/:identifier', skillController.getSkillById);

module.exports = router;