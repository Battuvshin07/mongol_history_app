// ============================================
// Quiz Controller (Full Admin Model)
// Matches Flutter admin QuizModel: title, description, difficulty,
//   topic, isPublished, questions[], updatedBy
// Admin: Create, Update, Delete
// Public: Read (published only for non-admins)
// ============================================

const Quiz = require('../models/Quiz.model');
const { STATUS, PAGINATION } = require('../config/constants');

/**
 * @desc    Get all quizzes (public sees published only; admin sees all)
 * @route   GET /api/quizzes
 * @access  Public (filtered) / Admin (all)
 */
const getAllQuizzes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(
      parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const filter = {};

    // Public only sees published quizzes
    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin) filter.isPublished = true;

    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { topic: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.topic) filter.topic = { $regex: req.query.topic, $options: 'i' };

    const sortField = req.query.sort || 'updatedAt';
    const sortDir = req.query.order === 'asc' ? 1 : -1;

    const [quizzes, total] = await Promise.all([
      Quiz.find(filter).sort({ [sortField]: sortDir }).skip(skip).limit(limit),
      Quiz.countDocuments(filter),
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
 * @desc    Get single quiz by MongoDB _id
 * @route   GET /api/quizzes/:id
 * @access  Public
 */
const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

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
    const { title, description, difficulty, topic, isPublished, questions, storyId } = req.body;
    const quiz = await Quiz.create({
      title,
      description: description || '',
      difficulty: difficulty || 'easy',
      topic: topic || '',
      isPublished: isPublished ?? false,
      questions: questions || [],
      storyId: storyId || null,
      updatedBy: req.user?.id?.toString(),
    });

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
 * @route   PATCH /api/quizzes/:id
 * @access  Private/Admin
 */
const updateQuiz = async (req, res, next) => {
  try {
    const update = { ...req.body, updatedBy: req.user?.id?.toString() };
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

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
 * @route   DELETE /api/quizzes/:id
 * @access  Private/Admin
 */
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);

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
