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
// Person Validation Rules
// ============================================

const personValidation = [
  body('personId')
    .notEmpty()
    .withMessage('Person ID is required')
    .isInt()
    .withMessage('Person ID must be an integer'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),

  body('birthDate').optional({ nullable: true }).isString(),
  body('deathDate').optional({ nullable: true }).isString(),
  body('imageUrl').optional({ nullable: true }).isString(),

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
// Quiz Validation Rules
// ============================================

const quizValidation = [
  body('quizId')
    .notEmpty()
    .withMessage('Quiz ID is required')
    .isInt()
    .withMessage('Quiz ID must be an integer'),

  body('question')
    .trim()
    .notEmpty()
    .withMessage('Question is required'),

  body('answers')
    .notEmpty()
    .withMessage('Answers are required')
    .isString()
    .withMessage('Answers must be a JSON string'),

  body('correctAnswer')
    .notEmpty()
    .withMessage('Correct answer index is required')
    .isInt({ min: 0, max: 3 })
    .withMessage('Correct answer must be between 0 and 3'),

  validate,
];

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
  paginationValidation,
};
