// ============================================
// EntreSkillHub - Admin Routes
// ============================================

const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly, superAdminOnly } = require('../middleware/roleCheck');
const { adminLimiter } = require('../middleware/rateLimiter');
const { userIdValidation, banUserValidation, updateAccountStatusValidation } = require('../validators/userValidator');

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);
router.use(adminLimiter);

// ============================================
// Dashboard & Analytics
// ============================================

router.get('/dashboard', adminController.getAdminDashboard);
router.get('/analytics', adminController.getPlatformAnalytics);
router.get('/stats', adminController.getPlatformStats);
router.get('/activity-logs', adminController.getActivityLogs);

// ============================================
// User Management
// ============================================

router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', userIdValidation, adminController.getUserDetails);
router.put('/users/:userId/status', updateAccountStatusValidation, adminController.updateUserStatus);
router.put('/users/:userId/ban', banUserValidation, adminController.banUser);
router.post('/users/bulk-action', adminController.bulkUserAction);

// SuperAdmin only actions
router.put('/users/:userId/role', superAdminOnly, adminController.changeUserRole);
router.delete('/users/:userId', superAdminOnly, adminController.deleteUser);

// ============================================
// Content Moderation
// ============================================

router.get('/content/pending', adminController.getPendingContent);
router.get('/content/reported', adminController.getReportedContent);
router.put('/content/:type/:id/feature', adminController.toggleFeatureContent);

// ============================================
// Notifications
// ============================================

router.post('/notifications/send', adminController.sendBulkNotification);

module.exports = router;