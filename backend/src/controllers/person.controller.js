// ============================================
// Person Controller
// Matches Flutter admin PersonModel: name, birthYear, deathYear,
//   shortBio, avatarUrl, tags[], updatedBy
// Admin: Create, Update, Delete
// Public: Read, Search
// ============================================

const Person = require('../models/Person.model');
const PersonDetail = require('../models/PersonDetail.model');
const { STATUS, PAGINATION } = require('../config/constants');

/**
 * @desc    Get all persons (with pagination + search)
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

    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { shortBio: { $regex: req.query.search, $options: 'i' } },
        { tags: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const sortField = req.query.sort || 'updatedAt';
    const sortDir = req.query.order === 'asc' ? 1 : -1;

    const [persons, total] = await Promise.all([
      Person.find(filter).sort({ [sortField]: sortDir }).skip(skip).limit(limit),
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
 * @desc    Get single person by MongoDB _id
 * @route   GET /api/persons/:id
 * @access  Public
 */
const getPersonById = async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id);

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
    const { name, birthYear, deathYear, shortBio, avatarUrl, tags } = req.body;
    const person = await Person.create({
      name,
      birthYear,
      deathYear,
      shortBio,
      avatarUrl,
      tags: tags || [],
      updatedBy: req.user?.id?.toString(),
    });

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
 * @route   PATCH /api/persons/:id
 * @access  Private/Admin
 */
const updatePerson = async (req, res, next) => {
  try {
    const update = { ...req.body, updatedBy: req.user?.id?.toString() };
    const person = await Person.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

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
 * @desc    Delete a person (and their PersonDetail)
 * @route   DELETE /api/persons/:id
 * @access  Private/Admin
 */
const deletePerson = async (req, res, next) => {
  try {
    const person = await Person.findByIdAndDelete(req.params.id);

    if (!person) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Person not found.',
      });
    }

    // Cascade delete person detail
    await PersonDetail.findOneAndDelete({ personId: person._id });

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