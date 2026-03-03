// ============================================
// Stories Controller (History Journey)
// Matches Flutter Story model: title, content, order, xpReward,
//   quizId?, imageUrl?, updatedBy
// GET    /api/stories        - public (ordered)
// GET    /api/stories/:id    - public
// POST   /api/stories        - admin
// PATCH  /api/stories/:id    - admin
// DELETE /api/stories/:id    - admin
// ============================================

const Story = require('../models/Story.model');
const { STATUS, PAGINATION } = require('../config/constants');

/**
 * @desc    Get all stories ordered by `order` ASC (with pagination)
 * @route   GET /api/stories
 * @access  Public
 */
const getAllStories = async (req, res, next) => {
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
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [stories, total] = await Promise.all([
      Story.find(filter)
        .populate('quizId', 'title difficulty isPublished') // populate quiz ref
        .sort({ order: 1 })
        .skip(skip)
        .limit(limit),
      Story.countDocuments(filter),
    ]);

    res.status(STATUS.OK).json({
      success: true,
      count: stories.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: { stories },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single story by id
 * @route   GET /api/stories/:id
 * @access  Public
 */
const getStoryById = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id).populate(
      'quizId',
      'title difficulty questions isPublished'
    );

    if (!story) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Story not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      data: { story },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new story
 * @route   POST /api/stories
 * @access  Private/Admin
 */
const createStory = async (req, res, next) => {
  try {
    const { title, content, order, xpReward, quizId, imageUrl } = req.body;
    const story = await Story.create({
      title,
      content,
      order,
      xpReward: xpReward ?? 100,
      quizId: quizId || null,
      imageUrl: imageUrl || null,
      updatedBy: req.user?.id?.toString(),
    });

    res.status(STATUS.CREATED).json({
      success: true,
      message: 'Story created successfully.',
      data: { story },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a story
 * @route   PATCH /api/stories/:id
 * @access  Private/Admin
 */
const updateStory = async (req, res, next) => {
  try {
    const update = { ...req.body, updatedBy: req.user?.id?.toString() };
    const story = await Story.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!story) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Story not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      message: 'Story updated successfully.',
      data: { story },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a story
 * @route   DELETE /api/stories/:id
 * @access  Private/Admin
 */
const deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findByIdAndDelete(req.params.id);

    if (!story) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Story not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      message: 'Story deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
};
