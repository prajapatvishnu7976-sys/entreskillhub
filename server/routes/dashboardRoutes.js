// ============================================
// EntreSkillHub - Dashboard Routes
// ============================================

const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');
const { protect, optionalAuth, requireMentor } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');
const { apiLimiter } = require('../middleware/rateLimiter');

// ============================================
// Public Routes
// ============================================

router.get('/platform-stats', apiLimiter, dashboardController.getPublicStats);

// ============================================
// Private Routes
// ============================================

router.get('/user', protect, dashboardController.getUserDashboard);
router.get('/mentor', protect, requireMentor, dashboardController.getMentorDashboard);
router.get('/admin', protect, adminOnly, dashboardController.getAdminDashboardData);
router.get('/quick-stats', protect, dashboardController.getQuickStats);
router.get('/recommendations', protect, dashboardController.getDashboardRecommendations);

module.exports = router;