// ============================================
// JWT Authentication Middleware
// Verifies JWT tokens on protected routes
// ============================================

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { JWT, STATUS } = require('../config/constants');

/**
 * Protect routes - Verify JWT token from Authorization header.
 * Attaches the authenticated user to req.user.
 *
 * Usage: router.get('/profile', protect, controller);
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from "Bearer <token>" header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // No token provided
    if (!token) {
      return res.status(STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT.SECRET);

    // Find user and attach to request (exclude password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not found. Token may be invalid.',
      });
    }

    // Check if user is still active
    if (!user.isActive) {
      return res.status(STATUS.FORBIDDEN).json({
        success: false,
        message: 'Account has been deactivated.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }

    return res.status(STATUS.INTERNAL_ERROR).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};

module.exports = { protect };
