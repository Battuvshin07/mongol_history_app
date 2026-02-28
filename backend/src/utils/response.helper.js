// ============================================
// API Response Helpers
// Consistent response formatting
// ============================================

/**
 * Send a success response.
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object} data - Response data
 */
const successResponse = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

/**
 * Send an error response.
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 */
const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

/**
 * Build pagination metadata.
 * @param {number} total - Total number of documents
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
const buildPagination = (total, page, limit) => {
  return {
    total,
    page,
    pages: Math.ceil(total / limit),
    limit,
    hasMore: page * limit < total,
  };
};

module.exports = {
  successResponse,
  errorResponse,
  buildPagination,
};
