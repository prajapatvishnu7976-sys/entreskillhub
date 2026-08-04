// ============================================
// EntreSkillHub - Bookmark Routes
// ============================================

const express = require('express');
const router = express.Router();

const bookmarkController = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

// All bookmark routes require authentication
router.use(protect);

// ============================================
// Overview Routes
// ============================================

router.get('/', bookmarkController.getUserBookmarks);
router.get('/search', bookmarkController.searchBookmarks);
router.get('/stats', bookmarkController.getBookmarkStats);
router.get('/collections', bookmarkController.getCollections);
router.get('/pinned', bookmarkController.getPinnedBookmarks);
router.get('/reminders/due', bookmarkController.getDueReminders);
router.get('/check', bookmarkController.checkBookmarked);

// ============================================
// Bookmark Actions
// ============================================

router.post('/toggle', bookmarkController.toggleBookmark);
router.delete('/bulk', bookmarkController.bulkDeleteBookmarks);

// ============================================
// Individual Bookmark Routes
// ============================================

router.put('/:id/pin', bookmarkController.togglePin);
router.put('/:id/favorite', bookmarkController.toggleFavorite);
router.put('/:id/archive', bookmarkController.archiveBookmark);
router.put('/:id/progress', bookmarkController.updateProgress);

// Highlights & Annotations
router.post('/:id/highlights', bookmarkController.addHighlight);
router.post('/:id/annotations', bookmarkController.addAnnotation);

// Reminders
router.post('/:id/reminder', bookmarkController.setReminder);

// Sharing
router.post('/:id/share', bookmarkController.shareBookmark);
router.post('/:id/share-link', bookmarkController.generateShareLink);

// CRUD (must be last)
router.get('/:id', bookmarkController.getBookmarkById);
router.put('/:id', bookmarkController.updateBookmark);
router.delete('/:id', bookmarkController.deleteBookmark);

module.exports = router;