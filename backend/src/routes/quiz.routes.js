// ============================================
// Quiz Routes
// GET    /api/quizzes           - Get all quizzes (public)
// GET    /api/quizzes/:quizId   - Get single quiz (public)
// POST   /api/quizzes           - Create quiz (admin)
// PUT    /api/quizzes/:quizId   - Update quiz (admin)
// DELETE /api/quizzes/:quizId   - Delete quiz (admin)
// ============================================

const express = require('express');
const router = express.Router();

const {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} = require('../controllers/quiz.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  quizValidation,
  paginationValidation,
} = require('../middleware/validate.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', paginationValidation, getAllQuizzes);
router.get('/:quizId', getQuizById);

// Admin-only routes
router.post('/', protect, authorize(ROLES.ADMIN), quizValidation, createQuiz);
router.put('/:quizId', protect, authorize(ROLES.ADMIN), updateQuiz);
router.delete('/:quizId', protect, authorize(ROLES.ADMIN), deleteQuiz);

module.exports = router;
