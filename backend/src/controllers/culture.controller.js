// ============================================
// Culture Controller
// CRUD for cultural data
// Admin: Create, Update, Delete
// Public: Read
// ============================================

const Culture = require('../models/Culture.model');
const { STATUS, PAGINATION } = require('../config/constants');

/**
 * @desc    Get all culture items
 * @route   GET /api/culture
 * @access  Public
 */
const getAllCulture = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(
      parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) filter.category = req.query.category;

    const [items, total] = await Promise.all([
      Culture.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Culture.countDocuments(filter),
    ]);

    res.status(STATUS.OK).json({
      success: true,
      count: items.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: { culture: items },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single culture item
 * @route   GET /api/culture/:id
 * @access  Public
 */
const getCultureById = async (req, res, next) => {
  try {
    const item = await Culture.findById(req.params.id);

    if (!item) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Culture item not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      data: { culture: item },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create culture item
 * @route   POST /api/culture
 * @access  Private/Admin
 */
const createCulture = async (req, res, next) => {
  try {
    const item = await Culture.create(req.body);

    res.status(STATUS.CREATED).json({
      success: true,
      message: 'Culture item created successfully.',
      data: { culture: item },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update culture item
 * @route   PUT /api/culture/:id
 * @access  Private/Admin
 */
const updateCulture = async (req, res, next) => {
  try {
    const item = await Culture.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Culture item not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      message: 'Culture item updated successfully.',
      data: { culture: item },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete culture item
 * @route   DELETE /api/culture/:id
 * @access  Private/Admin
 */
const deleteCulture = async (req, res, next) => {
  try {
    const item = await Culture.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Culture item not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      message: 'Culture item deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCulture,
  getCultureById,
  createCulture,
  updateCulture,
  deleteCulture,
};
