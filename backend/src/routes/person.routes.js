// ============================================
// Person Routes
// GET    /api/persons            - Get all persons (public)
// GET    /api/persons/:personId  - Get single person (public)
// POST   /api/persons            - Create person (admin)
// PUT    /api/persons/:personId  - Update person (admin)
// DELETE /api/persons/:personId  - Delete person (admin)
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
const {
  personValidation,
  paginationValidation,
} = require('../middleware/validate.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', paginationValidation, getAllPersons);
router.get('/:personId', getPersonById);

// Admin-only routes
router.post('/', protect, authorize(ROLES.ADMIN), personValidation, createPerson);
router.put('/:personId', protect, authorize(ROLES.ADMIN), updatePerson);
router.delete('/:personId', protect, authorize(ROLES.ADMIN), deletePerson);

module.exports = router;
