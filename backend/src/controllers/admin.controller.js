// ============================================
// Admin Controller
// Handles admin dashboard, analytics, user management
// ============================================

const { STATUS } = require('../config/constants');
const adminService = require('../services/admin.service');
const Culture = require('../models/Culture.model');

/**
 * @desc    Get dashboard quick stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();

    res.status(STATUS.OK).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user growth analytics (last N days)
 * @route   GET /api/admin/analytics/growth?days=30
 * @access  Private/Admin
 */
const getUserGrowth = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const growth = await adminService.getUserGrowthAnalytics(days);

    res.status(STATUS.OK).json({
      success: true,
      data: growth,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get topic distribution across content categories
 * @route   GET /api/admin/analytics/topics
 * @access  Private/Admin
 */
const getTopicDistribution = async (req, res, next) => {
  try {
    const distribution = await adminService.getTopicDistribution();

    res.status(STATUS.OK).json({
      success: true,
      data: distribution,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get quiz performance overview
 * @route   GET /api/admin/analytics/quiz-performance
 * @access  Private/Admin
 */
const getQuizPerformance = async (req, res, next) => {
  try {
    const performance = await adminService.getQuizPerformance();

    res.status(STATUS.OK).json({
      success: true,
      data: performance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated user list with search/filter
 * @route   GET /api/admin/users?page=1&limit=20&search=&role=&status=
 * @access  Private/Admin
 */
const getUserList = async (req, res, next) => {
  try {
    const { page, limit, search, role, status } = req.query;

    const result = await adminService.getUserList({
      page: parseInt(page) || 1,
      limit: Math.min(parseInt(limit) || 20, 100),
      search: search || '',
      role: role || '',
      status: status || '',
    });

    res.status(STATUS.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a user's role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 *
 * Body: { role: 'admin' | 'user' }
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await adminService.updateUserRole(req.params.id, role);

    res.status(STATUS.OK).json({
      success: true,
      message: `User role updated to ${role}.`,
      data: { user },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Suspend a user account
 * @route   PUT /api/admin/users/:id/suspend
 * @access  Private/Admin
 */
const suspendUser = async (req, res, next) => {
  try {
    const user = await adminService.toggleUserSuspension(req.params.id, true);

    res.status(STATUS.OK).json({
      success: true,
      message: 'User account suspended.',
      data: { user },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Activate (unsuspend) a user account
 * @route   PUT /api/admin/users/:id/activate
 * @access  Private/Admin
 */
const activateUser = async (req, res, next) => {
  try {
    const user = await adminService.toggleUserSuspension(req.params.id, false);

    res.status(STATUS.OK).json({
      success: true,
      message: 'User account activated.',
      data: { user },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete a user permanently
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const deleted = await adminService.deleteUser(
      req.params.id,
      req.user.id // prevent self-deletion
    );

    res.status(STATUS.OK).json({
      success: true,
      message: `User "${deleted.name}" has been deleted.`,
      data: { deleted },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Get recent activity (user logins/registrations)
 * @route   GET /api/admin/activity?limit=20
 * @access  Private/Admin
 */
const getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const activity = await adminService.getRecentActivity(limit);

    res.status(STATUS.OK).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUserGrowth,
  getTopicDistribution,
  getQuizPerformance,
  getUserList,
  updateUserRole,
  suspendUser,
  activateUser,
  deleteUser,
  getRecentActivity,
  // Culture management
  listCultures,
  createCulture,
  updateCulture,
  deleteCulture,
};

// ── Culture CRUD (Admin) ─────────────────────────────────────────

/**
 * @desc    List all culture items (sorted by order)
 * @route   GET /api/admin/cultures
 * @access  Private/Admin
 */
async function listCultures(req, res, next) {
  try {
    const items = await Culture.find({}).sort({ order: 1 });
    res.status(STATUS.OK).json({ success: true, count: items.length, data: { cultures: items } });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Create a culture item
 * @route   POST /api/admin/cultures
 * @access  Private/Admin
 *
 * Body: { title, description, icon, details, coverImageUrl, order }
 */
async function createCulture(req, res, next) {
  try {
    const { title, description, icon, details, coverImageUrl, order } = req.body;
    const item = await Culture.create({
      title,
      description,
      icon: icon ?? null,
      details: details ?? null,
      coverImageUrl: coverImageUrl ?? null,
      order: order ?? 0,
      updatedBy: req.user?.id?.toString(),
    });
    res.status(STATUS.CREATED).json({
      success: true,
      message: 'Culture item created.',
      data: { culture: item },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Update a culture item
 * @route   PATCH /api/admin/cultures/:id
 * @access  Private/Admin
 */
async function updateCulture(req, res, next) {
  try {
    const update = { ...req.body, updatedBy: req.user?.id?.toString() };
    const item = await Culture.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(STATUS.NOT_FOUND).json({ success: false, message: 'Culture item not found.' });
    }
    res.status(STATUS.OK).json({ success: true, message: 'Culture item updated.', data: { culture: item } });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Delete a culture item
 * @route   DELETE /api/admin/cultures/:id
 * @access  Private/Admin
 */
async function deleteCulture(req, res, next) {
  try {
    const item = await Culture.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(STATUS.NOT_FOUND).json({ success: false, message: 'Culture item not found.' });
    }
    res.status(STATUS.OK).json({ success: true, message: 'Culture item deleted.' });
  } catch (err) {
    next(err);
  }
}
