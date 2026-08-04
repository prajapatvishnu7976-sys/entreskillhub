// ============================================
// EntreSkillHub - Progress Routes
// ============================================

const express = require('express');
const router = express.Router();

const progressController = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

// All progress routes require authentication
router.use(protect);

// ============================================
// Overview Routes
// ============================================

router.get('/overview', progressController.getProgressOverview);
router.get('/my', progressController.getAllMyProgress);
router.get('/achievements', progressController.getAchievements);
router.get('/streak', progressController.getStreakInfo);
router.get('/financial-summary', progressController.getFinancialSummary);
router.get('/activity-calendar', progressController.getActivityCalendar);

// ============================================
// Roadmap-specific Progress
// ============================================

router.get('/roadmap/:roadmapId', progressController.getRoadmapProgress);

// ============================================
// Progress Actions
// ============================================

// Reflections
router.post('/:progressId/reflection', progressController.addReflection);

// Challenges
router.post('/:progressId/challenge', progressController.addChallenge);
router.put('/:progressId/challenge/:challengeId/resolve', progressController.resolveChallenge);

// Wins
router.post('/:progressId/win', progressController.addWin);

// Goals
router.post('/:progressId/goal', progressController.addGoal);
router.put('/:progressId/goal/:goalId/achieve', progressController.achieveGoal);

// Financial Tracking
router.post('/:progressId/expense', progressController.addExpense);
router.post('/:progressId/revenue', progressController.addRevenue);

// Pause/Resume
router.put('/:progressId/pause', progressController.pauseProgress);
router.put('/:progressId/resume', progressController.resumeProgress);

module.exports = router;