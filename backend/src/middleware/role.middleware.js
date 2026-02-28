// ============================================
// Role-Based Access Control Middleware
// Restricts route access based on user role
// ============================================

const { STATUS } = require('../config/constants');

/**
 * Restrict access to specific roles.
 * Must be used AFTER the protect middleware (req.user must exist).
 *
 * Usage: router.post('/admin-action', protect, authorize('admin'), controller);
 *
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'user')
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Ensure protect middleware ran first
    if (!req.user) {
      return res.status(STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required before authorization.',
      });
    }

    // Check if user's role is in the allowed roles list
    if (!roles.includes(req.user.role)) {
      return res.status(STATUS.FORBIDDEN).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized for this action. Required: ${roles.join(' or ')}.`,
      });
    }

    next();
  };
};

module.exports = { authorize };
