// ============================================
// Admin Routes
// All routes require authentication + admin role
//
// GET    /api/admin/stats                    - Dashboard quick stats
// GET    /api/admin/analytics/growth         - User growth chart data
// GET    /api/admin/analytics/topics         - Topic distribution
// GET    /api/admin/analytics/quiz-performance - Quiz performance
// GET    /api/admin/users                    - Paginated user list
// PUT    /api/admin/users/:id/role           - Change user role
// PUT    /api/admin/users/:id/suspend        - Suspend user
// PUT    /api/admin/users/:id/activate       - Activate user
// DELETE /api/admin/users/:id               - Delete user
// GET    /api/admin/activity                 - Recent activity log
//
// Culture management (admin)
// GET    /api/admin/cultures                 - List all cultures
// POST   /api/admin/cultures                 - Create culture
// PATCH  /api/admin/cultures/:id             - Update culture
// DELETE /api/admin/cultures/:id             - Delete culture
// ============================================

const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  getUserGrowth,
  getTopicDistribution,
  getQuizPerformance,
  getUserList,
  updateUserRole,
  suspendUser,
  activateUser,
  deleteUser,
  getRecentActivity,
  listCultures,
  createCulture,
  updateCulture,
  deleteCulture,
} = require('../controllers/admin.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { ROLES } = require('../config/constants');

// All admin routes require authentication + admin role
router.use(protect);
router.use(authorize(ROLES.ADMIN));

// Dashboard stats
router.get('/stats', getDashboardStats);

// Analytics
router.get('/analytics/growth', getUserGrowth);
router.get('/analytics/topics', getTopicDistribution);
router.get('/analytics/quiz-performance', getQuizPerformance);

// User management
router.get('/users', getUserList);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/activate', activateUser);
router.delete('/users/:id', deleteUser);

// Activity
router.get('/activity', getRecentActivity);

// Culture management
router.get('/cultures', listCultures);
router.post('/cultures', createCulture);
router.patch('/cultures/:id', updateCulture);
router.delete('/cultures/:id', deleteCulture);

module.exports = router;
