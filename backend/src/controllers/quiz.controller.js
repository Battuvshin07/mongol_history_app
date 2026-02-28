// ============================================
// Quiz Controller
// CRUD for quiz questions
// Admin: Create, Update, Delete
// Public: Read
// ============================================

const Quiz = require('../models/Quiz.model');
const { STATUS, PAGINATION } = require('../config/constants');

/**
 * @desc    Get all quizzes (with pagination)
 * @route   GET /api/quizzes
 * @access  Public
 */
const getAllQuizzes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(
      parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const [quizzes, total] = await Promise.all([
      Quiz.find().sort({ quizId: 1 }).skip(skip).limit(limit),
      Quiz.countDocuments(),
    ]);

    res.status(STATUS.OK).json({
      success: true,
      count: quizzes.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: { quizzes },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single quiz by quizId
 * @route   GET /api/quizzes/:quizId
 * @access  Public
 */
const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ quizId: parseInt(req.params.quizId) });

    if (!quiz) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Quiz not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      data: { quiz },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new quiz
 * @route   POST /api/quizzes
 * @access  Private/Admin
 */
const createQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.create(req.body);

    res.status(STATUS.CREATED).json({
      success: true,
      message: 'Quiz created successfully.',
      data: { quiz },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a quiz
 * @route   PUT /api/quizzes/:quizId
 * @access  Private/Admin
 */
const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOneAndUpdate(
      { quizId: parseInt(req.params.quizId) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Quiz not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      message: 'Quiz updated successfully.',
      data: { quiz },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a quiz
 * @route   DELETE /api/quizzes/:quizId
 * @access  Private/Admin
 */
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOneAndDelete({
      quizId: parseInt(req.params.quizId),
    });

    if (!quiz) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Quiz not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      message: 'Quiz deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
};
