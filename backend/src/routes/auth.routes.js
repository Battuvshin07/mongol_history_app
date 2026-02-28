// ============================================
// Auth Routes
// POST /api/auth/register  - Register new user
// POST /api/auth/login     - Login user
// GET  /api/auth/me        - Get profile (protected)
// PUT  /api/auth/me        - Update profile (protected)
// PUT  /api/auth/change-password - Change password (protected)
// GET  /api/auth/users     - Get all users (admin only)
// ============================================

const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
} = require('../controllers/auth.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  registerValidation,
  loginValidation,
} = require('../middleware/validate.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes (any authenticated user)
router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Admin-only routes
router.get('/users', protect, authorize(ROLES.ADMIN), getAllUsers);

module.exports = router;
