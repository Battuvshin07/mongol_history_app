// ============================================
// FamilyTree Routes
// GET    /api/family-trees        - public
// GET    /api/family-trees/:id    - public
// POST   /api/family-trees        - admin
// PATCH  /api/family-trees/:id    - admin
// DELETE /api/family-trees/:id    - admin
// ============================================

const express = require('express');
const router = express.Router();

const {
  getAllFamilyTrees,
  getFamilyTreeById,
  createFamilyTree,
  updateFamilyTree,
  deleteFamilyTree,
} = require('../controllers/family-trees.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { paginationValidation } = require('../middleware/validate.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', paginationValidation, getAllFamilyTrees);
router.get('/:id', getFamilyTreeById);

// Admin-only routes
router.post('/', protect, authorize(ROLES.ADMIN), createFamilyTree);
router.patch('/:id', protect, authorize(ROLES.ADMIN), updateFamilyTree);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateFamilyTree); // backward compat
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteFamilyTree);

module.exports = router;
