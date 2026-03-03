// ============================================
// Story Routes (History Journey)
// GET    /api/stories        - public
// GET    /api/stories/:id    - public
// POST   /api/stories        - admin
// PATCH  /api/stories/:id    - admin
// DELETE /api/stories/:id    - admin
// ============================================

const express = require('express');
const router = express.Router();

const {
  getAllStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
} = require('../controllers/stories.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  storyValidation,
  paginationValidation,
} = require('../middleware/validate.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', paginationValidation, getAllStories);
router.get('/:id', getStoryById);

// Admin-only routes
router.post('/', protect, authorize(ROLES.ADMIN), storyValidation, createStory);
router.patch('/:id', protect, authorize(ROLES.ADMIN), updateStory);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateStory); // backward compat
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteStory);

module.exports = router;
