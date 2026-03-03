// ============================================
// Users Routes (admin management)
// GET    /api/users             - all users (admin)
// GET    /api/users/stats       - user stats (admin)
// PATCH  /api/users/:id/role    - set role (admin)
// DELETE /api/users/:id         - deactivate user (admin)
// ============================================

const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getUserStats,
  setUserRole,
  deactivateUser,
} = require('../controllers/users.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { ROLES } = require('../config/constants');

// All users routes require admin access
router.get('/stats', protect, authorize(ROLES.ADMIN), getUserStats);
router.get('/', protect, authorize(ROLES.ADMIN), getAllUsers);
router.patch('/:id/role', protect, authorize(ROLES.ADMIN), setUserRole);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deactivateUser);

module.exports = router;
