// ============================================
// Progress Routes (per-user per-story)
// GET  /api/progress/me                         - auth (current user)
// POST /api/progress/:storyId/mark-studied      - auth
// POST /api/progress/:storyId/submit-quiz       - auth { score, total }
// ============================================

const express = require('express');
const router = express.Router();

const {
  getMyProgress,
  markStudied,
  submitQuiz,
} = require('../controllers/progress.controller');

const { protect } = require('../middleware/auth.middleware');

// All progress routes require authentication
router.get('/me', protect, getMyProgress);
router.post('/:storyId/mark-studied', protect, markStudied);
router.post('/:storyId/submit-quiz', protect, submitQuiz);

module.exports = router;
