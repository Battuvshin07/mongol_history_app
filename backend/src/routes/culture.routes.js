// ============================================
// Culture Routes
// GET    /api/cultures      - Get all cultures (public)
// GET    /api/cultures/:id  - Get single culture (public)
// POST   /api/cultures      - Create culture (admin)
// PATCH  /api/cultures/:id  - Update culture (admin)
// DELETE /api/cultures/:id  - Delete culture (admin)
// ============================================

const express = require('express');
const router = express.Router();

const {
  getAllCulture,
  getCultureById,
  createCulture,
  updateCulture,
  deleteCulture,
} = require('../controllers/culture.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { paginationValidation } = require('../middleware/validate.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', paginationValidation, getAllCulture);
router.get('/:id', getCultureById);

// Admin-only routes
router.post('/', protect, authorize(ROLES.ADMIN), createCulture);
router.patch('/:id', protect, authorize(ROLES.ADMIN), updateCulture);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateCulture); // backward compat
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteCulture);

module.exports = router;
