// ============================================
// Auth Service
// Business logic for authentication operations
// ============================================

const User = require('../models/User.model');

/**
 * Find user by email address.
 * @param {string} email
 * @returns {Promise<User|null>}
 */
const findUserByEmail = async (email) => {
  return await User.findOne({ email: email.toLowerCase() });
};

/**
 * Find user by ID.
 * @param {string} id - MongoDB ObjectId
 * @returns {Promise<User|null>}
 */
const findUserById = async (id) => {
  return await User.findById(id).select('-password');
};

/**
 * Create a new user.
 * @param {Object} userData - { name, email, password, role }
 * @returns {Promise<User>}
 */
const createUser = async (userData) => {
  return await User.create(userData);
};

/**
 * Get total count of users.
 * @returns {Promise<number>}
 */
const getUserCount = async () => {
  return await User.countDocuments();
};

/**
 * Check if any admin user exists (useful for initial setup).
 * @returns {Promise<boolean>}
 */
const adminExists = async () => {
  const admin = await User.findOne({ role: 'admin' });
  return !!admin;
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  getUserCount,
  adminExists,
};
