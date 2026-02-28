// ============================================
// Person Controller
// CRUD for historical persons
// Admin: Create, Update, Delete
// Public: Read, Search
// ============================================

const Person = require('../models/Person.model');
const { STATUS, PAGINATION } = require('../config/constants');

/**
 * @desc    Get all persons (with pagination)
 * @route   GET /api/persons
 * @access  Public
 */
const getAllPersons = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(
      parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    // Search support
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [persons, total] = await Promise.all([
      Person.find(filter).sort({ personId: 1 }).skip(skip).limit(limit),
      Person.countDocuments(filter),
    ]);

    res.status(STATUS.OK).json({
      success: true,
      count: persons.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: { persons },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single person by personId
 * @route   GET /api/persons/:personId
 * @access  Public
 */
const getPersonById = async (req, res, next) => {
  try {
    const person = await Person.findOne({ personId: parseInt(req.params.personId) });

    if (!person) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Person not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      data: { person },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new person
 * @route   POST /api/persons
 * @access  Private/Admin
 */
const createPerson = async (req, res, next) => {
  try {
    const person = await Person.create(req.body);

    res.status(STATUS.CREATED).json({
      success: true,
      message: 'Person created successfully.',
      data: { person },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a person
 * @route   PUT /api/persons/:personId
 * @access  Private/Admin
 */
const updatePerson = async (req, res, next) => {
  try {
    const person = await Person.findOneAndUpdate(
      { personId: parseInt(req.params.personId) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!person) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Person not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      message: 'Person updated successfully.',
      data: { person },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a person
 * @route   DELETE /api/persons/:personId
 * @access  Private/Admin
 */
const deletePerson = async (req, res, next) => {
  try {
    const person = await Person.findOneAndDelete({
      personId: parseInt(req.params.personId),
    });

    if (!person) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Person not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      message: 'Person deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
};
