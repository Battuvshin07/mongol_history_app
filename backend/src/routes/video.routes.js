// ============================================
// Video Routes
// GET    /api/videos      - Get published videos (public)
// GET    /api/videos/:id  - Get single video (public)
// POST   /api/videos      - Create video (admin)
// PATCH  /api/videos/:id  - Update video (admin)
// DELETE /api/videos/:id  - Delete video (admin)
// ============================================

const express = require('express');
const router = express.Router();

const {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
} = require('../controllers/video.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { paginationValidation } = require('../middleware/validate.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', paginationValidation, getAllVideos);
router.get('/:id', getVideoById);

// Admin-only routes
router.post('/', protect, authorize(ROLES.ADMIN), createVideo);
router.patch('/:id', protect, authorize(ROLES.ADMIN), updateVideo);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteVideo);

module.exports = router;
