// ============================================
// Auth Controller
// Handles user registration, login, profile
// ============================================

const User = require('../models/User.model');
const { STATUS, ROLES } = require('../config/constants');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 *
 * Request body:
 *   { name: string, email: string, password: string, role?: 'admin' | 'user' }
 *
 * Response:
 *   { success: true, message: string, data: { user: Object, token: string } }
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(STATUS.CONFLICT).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || ROLES.USER,
    });

    // Generate JWT token
    const token = user.generateToken();

    res.status(STATUS.CREATED).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: user.toSafeObject(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 *
 * Request body:
 *   { email: string, password: string }
 *
 * Response:
 *   { success: true, message: string, data: { user: Object, token: string } }
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(STATUS.FORBIDDEN).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.',
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate JWT token
    const token = user.generateToken();

    res.status(STATUS.OK).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: user.toSafeObject(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated user's profile
 * @route   GET /api/auth/me
 * @access  Private (requires JWT)
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      data: { user: user.toSafeObject() },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile (name, email)
 * @route   PUT /api/auth/me
 * @access  Private (requires JWT)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: user.toSafeObject() },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private (requires JWT)
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    // Generate a new token after password change
    const token = user.generateToken();

    res.status(STATUS.OK).json({
      success: true,
      message: 'Password changed successfully.',
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(STATUS.OK).json({
      success: true,
      count: users.length,
      data: { users: users.map((u) => u.toSafeObject()) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
};
