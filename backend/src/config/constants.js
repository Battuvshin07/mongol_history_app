// ============================================
// Application Constants
// Centralized configuration values
// ============================================

module.exports = {
  // User roles
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
  },

  // JWT configuration
  JWT: {
    EXPIRE: process.env.JWT_EXPIRE || '7d',
    SECRET: process.env.JWT_SECRET || 'default_secret_change_me',
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  // HTTP Status Codes (commonly used)
  STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
  },
};
