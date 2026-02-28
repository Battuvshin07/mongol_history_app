// ============================================
// Content Controller
// CRUD operations for generic content
// Admin: Create, Update, Delete
// Public/User: Read
// ============================================

const Content = require('../models/Content.model');
const { STATUS, PAGINATION } = require('../config/constants');

/**
 * @desc    Get all content (with pagination & filtering)
 * @route   GET /api/content
 * @access  Public
 *
 * Query params: ?page=1&limit=20&category=featured&published=true
 */
const getAllContent = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(
      parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.published !== undefined) {
      filter.isPublished = req.query.published === 'true';
    } else {
      filter.isPublished = true; // Default: only published content
    }

    const [content, total] = await Promise.all([
      Content.find(filter)
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Content.countDocuments(filter),
    ]);

    res.status(STATUS.OK).json({
      success: true,
      count: content.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: { content },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single content by ID
 * @route   GET /api/content/:id
 * @access  Public
 */
const getContentById = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id).populate(
      'author',
      'name email'
    );

    if (!content) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Content not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      data: { content },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new content
 * @route   POST /api/content
 * @access  Private/Admin
 */
const createContent = async (req, res, next) => {
  try {
    // Attach the authenticated admin as the author
    req.body.author = req.user.id;

    const content = await Content.create(req.body);

    // Populate author for response
    await content.populate('author', 'name email');

    res.status(STATUS.CREATED).json({
      success: true,
      message: 'Content created successfully.',
      data: { content },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update content
 * @route   PUT /api/content/:id
 * @access  Private/Admin
 */
const updateContent = async (req, res, next) => {
  try {
    const content = await Content.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('author', 'name email');

    if (!content) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Content not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      message: 'Content updated successfully.',
      data: { content },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete content
 * @route   DELETE /api/content/:id
 * @access  Private/Admin
 */
const deleteContent = async (req, res, next) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);

    if (!content) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Content not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      message: 'Content deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
};
