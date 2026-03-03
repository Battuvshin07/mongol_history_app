// ============================================
// Person Routes
// GET    /api/persons      - Get all persons (public)
// GET    /api/persons/:id  - Get single person (public)
// POST   /api/persons      - Create person (admin)
// PATCH  /api/persons/:id  - Update person (admin)
// DELETE /api/persons/:id  - Delete person + detail (admin)
// ============================================

const express = require('express');
const router = express.Router();

const {
  getAllPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
} = require('../controllers/person.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { paginationValidation } = require('../middleware/validate.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', paginationValidation, getAllPersons);
router.get('/:id', getPersonById);

// Admin-only routes
router.post('/', protect, authorize(ROLES.ADMIN), createPerson);
router.patch('/:id', protect, authorize(ROLES.ADMIN), updatePerson);
router.put('/:id', protect, authorize(ROLES.ADMIN), updatePerson); // backward compat
router.delete('/:id', protect, authorize(ROLES.ADMIN), deletePerson);

module.exports = router;
