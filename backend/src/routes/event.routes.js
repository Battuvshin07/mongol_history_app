// ============================================
// Event Routes
// GET    /api/events            - Get all events (public)
// GET    /api/events/:eventId   - Get single event (public)
// POST   /api/events            - Create event (admin)
// PUT    /api/events/:eventId   - Update event (admin)
// DELETE /api/events/:eventId   - Delete event (admin)
// ============================================

const express = require('express');
const router = express.Router();

const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/event.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  eventValidation,
  paginationValidation,
} = require('../middleware/validate.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', paginationValidation, getAllEvents);
router.get('/:eventId', getEventById);

// Admin-only routes
router.post('/', protect, authorize(ROLES.ADMIN), eventValidation, createEvent);
router.put('/:eventId', protect, authorize(ROLES.ADMIN), updateEvent);
router.delete('/:eventId', protect, authorize(ROLES.ADMIN), deleteEvent);

module.exports = router;
