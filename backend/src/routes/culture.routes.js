// ============================================
// Culture Routes
// GET    /api/culture      - Get all culture items (public)
// GET    /api/culture/:id  - Get single culture item (public)
// POST   /api/culture      - Create culture item (admin)
// PUT    /api/culture/:id  - Update culture item (admin)
// DELETE /api/culture/:id  - Delete culture item (admin)
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
router.put('/:id', protect, authorize(ROLES.ADMIN), updateCulture);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteCulture);

module.exports = router;
