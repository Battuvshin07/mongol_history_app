// ============================================
// Validation Middleware
// Input validation using express-validator
// ============================================

const { body, param, query, validationResult } = require('express-validator');
const { STATUS } = require('../config/constants');

/**
 * Process validation results and return errors if any.
 * Place this after validation chains in the route definition.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

// ============================================
// Auth Validation Rules
// ============================================

const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user'),

  validate,
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  validate,
];

// ============================================
// Content Validation Rules
// ============================================

const contentValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),

  body('imageUrl')
    .optional({ nullable: true })
    .isURL()
    .withMessage('Image URL must be a valid URL'),

  body('category')
    .optional()
    .isIn(['general', 'announcement', 'featured', 'news'])
    .withMessage('Invalid category'),

  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),

  validate,
];

// ============================================
// Person Validation Rules (admin PersonModel)
// Fields: name, birthYear?, deathYear?, shortBio, avatarUrl?, tags[]
// ============================================

const personValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 200 })
    .withMessage('Name cannot exceed 200 characters'),

  body('shortBio')
    .trim()
    .notEmpty()
    .withMessage('Short bio is required'),

  body('birthYear')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Birth year must be an integer'),

  body('deathYear')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Death year must be an integer'),

  body('avatarUrl')
    .optional({ nullable: true })
    .isString(),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  validate,
];

// ============================================
// Event Validation Rules
// ============================================

const eventValidation = [
  body('eventId')
    .notEmpty()
    .withMessage('Event ID is required')
    .isInt()
    .withMessage('Event ID must be an integer'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),

  body('date')
    .notEmpty()
    .withMessage('Date is required'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),

  body('personId')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Person ID must be an integer'),

  validate,
];

// ============================================
// Quiz Validation Rules (admin QuizModel)
// Fields: title, description, difficulty, topic, isPublished, questions[]
// ============================================

const quizValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 300 })
    .withMessage('Title cannot exceed 300 characters'),

  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),

  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),

  body('questions')
    .optional()
    .isArray()
    .withMessage('Questions must be an array'),

  body('questions.*.question')
    .if(body('questions').exists())
    .trim()
    .notEmpty()
    .withMessage('Each question must have text'),

  body('questions.*.options')
    .if(body('questions').exists())
    .isArray({ min: 4, max: 4 })
    .withMessage('Each question must have exactly 4 options'),

  body('questions.*.correctIndex')
    .if(body('questions').exists())
    .isInt({ min: 0, max: 3 })
    .withMessage('correctIndex must be 0-3'),

  validate,
];

// ============================================
// Story Validation Rules
// Fields: title, content, order, xpReward, quizId?, imageUrl?
// ============================================

const storyValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 300 })
    .withMessage('Title cannot exceed 300 characters'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),

  body('order')
    .notEmpty()
    .withMessage('Order is required')
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),

  body('xpReward')
    .optional()
    .isInt({ min: 0 })
    .withMessage('xpReward must be a non-negative integer'),

  body('quizId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('quizId must be a valid MongoDB id'),

  validate,];

// ============================================
// Culture Validation Rules
// Fields: title, description, coverImageUrl?, order?
// ============================================

const cultureValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),

  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),

  validate,];

// ============================================
// Pagination Validation
// ============================================

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  validate,
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  contentValidation,
  personValidation,
  eventValidation,
  quizValidation,
  storyValidation,
  cultureValidation,
  paginationValidation,
};
