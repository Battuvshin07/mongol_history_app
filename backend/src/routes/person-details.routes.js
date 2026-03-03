// ============================================
// PersonDetail Routes
// GET    /api/person-details/:personId  - public
// PUT    /api/person-details/:personId  - admin (upsert)
// DELETE /api/person-details/:personId  - admin
// ============================================

const express = require('express');
const router = express.Router();

const {
  getPersonDetail,
  upsertPersonDetail,
  deletePersonDetail,
} = require('../controllers/person-details.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/:personId', getPersonDetail);

// Admin-only routes
router.put('/:personId', protect, authorize(ROLES.ADMIN), upsertPersonDetail);
router.delete('/:personId', protect, authorize(ROLES.ADMIN), deletePersonDetail);

module.exports = router;
