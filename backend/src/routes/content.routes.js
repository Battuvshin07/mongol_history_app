// ============================================
// Content Routes
// GET    /api/content      - Get all content (public)
// GET    /api/content/:id  - Get single content (public)
// POST   /api/content      - Create content (admin)
// PUT    /api/content/:id  - Update content (admin)
// DELETE /api/content/:id  - Delete content (admin)
// ============================================

const express = require('express');
const router = express.Router();

const {
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
} = require('../controllers/content.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  contentValidation,
  paginationValidation,
} = require('../middleware/validate.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', paginationValidation, getAllContent);
router.get('/:id', getContentById);

// Admin-only routes
router.post('/', protect, authorize(ROLES.ADMIN), contentValidation, createContent);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateContent);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteContent);

module.exports = router;
