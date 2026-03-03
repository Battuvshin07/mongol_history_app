// ============================================
// Users Controller (Admin user management)
// GET    /api/users          - get all users (admin)
// GET    /api/users/stats    - user stats (admin)
// PATCH  /api/users/:id/role - set role (admin)
// DELETE /api/users/:id      - deactivate user (admin)
// ============================================

const User = require('../models/User.model');
const { STATUS, PAGINATION } = require('../config/constants');

/**
 * @desc    Get all users (admin)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
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
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.role) filter.role = req.query.role;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(STATUS.OK).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: { users: users.map((u) => u.toSafeObject()) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user stats (count by role)
 * @route   GET /api/users/stats
 * @access  Private/Admin
 */
const getUserStats = async (req, res, next) => {
  try {
    const [totalUsers, totalAdmins, totalActive] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ isActive: true }),
    ]);

    res.status(STATUS.OK).json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        totalActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set user role (admin only)
 * @route   PATCH /api/users/:id/role
 * @access  Private/Admin
 */
const setUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: "Role must be 'user' or 'admin'.",
      });
    }

    // Prevent changing own role
    if (req.params.id === req.user.id.toString()) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: 'You cannot change your own role.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      message: `User role updated to '${role}'.`,
      data: { user: user.toSafeObject() },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Deactivate (soft-delete) a user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deactivateUser = async (req, res, next) => {
  try {
    // Prevent self-deactivation
    if (req.params.id === req.user.id.toString()) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: 'You cannot deactivate your own account.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      message: 'User deactivated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserStats,
  setUserRole,
  deactivateUser,
};
