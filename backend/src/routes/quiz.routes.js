// ============================================
// Quiz Routes (Full Admin Model)
// GET    /api/quizzes      - Get all quizzes (public=published, admin=all)
// GET    /api/quizzes/:id  - Get single quiz (public)
// POST   /api/quizzes      - Create quiz (admin)
// PATCH  /api/quizzes/:id  - Update quiz (admin)
// DELETE /api/quizzes/:id  - Delete quiz (admin)
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

// Optional auth middleware: attaches req.user if token present, otherwise continues
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return protect(req, res, next);
  }
  next();
};

// Public routes (optionally pass auth to distinguish admin vs public)
router.get('/', paginationValidation, optionalAuth, getAllQuizzes);
router.get('/:id', getQuizById);

// Admin-only routes
router.post('/', protect, authorize(ROLES.ADMIN), quizValidation, createQuiz);
router.patch('/:id', protect, authorize(ROLES.ADMIN), updateQuiz);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateQuiz); // backward compat
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteQuiz);

module.exports = router;
