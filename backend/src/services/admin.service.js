// ============================================
// Admin Service
// Business logic for admin dashboard operations
// Stats, analytics, user management
// ============================================

const User = require('../models/User.model');
const Person = require('../models/Person.model');
const Event = require('../models/Event.model');
const Quiz = require('../models/Quiz.model');
const Culture = require('../models/Culture.model');
const Content = require('../models/Content.model');

/**
 * Get dashboard quick stats.
 * Returns total users, active today, total XP placeholder, total quizzes, total content.
 */
const getDashboardStats = async () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalUsers,
    activeToday,
    totalQuizzes,
    totalContent,
    totalPersons,
    totalEvents,
    totalCulture,
    adminCount,
    userCount,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ lastLogin: { $gte: todayStart } }),
    Quiz.countDocuments(),
    Content.countDocuments(),
    Person.countDocuments(),
    Event.countDocuments(),
    Culture.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'user' }),
  ]);

  return {
    totalUsers,
    activeToday,
    totalQuizzes,
    totalContent,
    totalPersons,
    totalEvents,
    totalCulture,
    adminCount,
    userCount,
    // Placeholder XP — replace with real aggregation when XP tracking is added
    totalXpDistributed: totalUsers * 150,
  };
};

/**
 * Get user growth data for the last N days.
 * Returns an array of { date, count } objects.
 * @param {number} days - Number of days to look back (default 30)
 */
const getUserGrowthAnalytics = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const pipeline = [
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        count: 1,
      },
    },
  ];

  const growth = await User.aggregate(pipeline);

  // Fill missing days with 0
  const result = [];
  const current = new Date(startDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  while (current <= today) {
    const dateStr = current.toISOString().split('T')[0];
    const found = growth.find((g) => g.date === dateStr);
    result.push({
      date: dateStr,
      count: found ? found.count : 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return result;
};

/**
 * Get most studied topics — distribution of content across categories.
 */
const getTopicDistribution = async () => {
  const [persons, events, quizzes, culture] = await Promise.all([
    Person.countDocuments(),
    Event.countDocuments(),
    Quiz.countDocuments(),
    Culture.countDocuments(),
  ]);

  return {
    labels: ['Persons', 'Events', 'Quizzes', 'Culture'],
    data: [persons, events, quizzes, culture],
  };
};

/**
 * Get quiz performance stats.
 * Placeholder — returns mock pass rate until quiz attempt tracking is added.
 */
const getQuizPerformance = async () => {
  const totalQuizzes = await Quiz.countDocuments();

  // Placeholder until quiz attempts are tracked
  return {
    totalQuizzes,
    passRate: 85,
    averageScore: 72,
    totalAttempts: totalQuizzes * 45,
  };
};

/**
 * Get paginated user list for admin management.
 * @param {Object} options - { page, limit, search, role, status }
 */
const getUserList = async (options = {}) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    role = '',
    status = '',
  } = options;

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role && ['admin', 'user'].includes(role)) {
    filter.role = role;
  }
  if (status === 'active') filter.isActive = true;
  if (status === 'suspended') filter.isActive = false;

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users: users.map((u) => u.toSafeObject()),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

/**
 * Update a user's role.
 * @param {string} userId
 * @param {string} newRole - 'admin' or 'user'
 */
const updateUserRole = async (userId, newRole) => {
  if (!['admin', 'user'].includes(newRole)) {
    throw Object.assign(new Error('Invalid role. Must be admin or user.'), {
      statusCode: 400,
    });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role: newRole },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  return user.toSafeObject();
};

/**
 * Suspend or activate a user account.
 * @param {string} userId
 * @param {boolean} suspend - true to suspend, false to activate
 */
const toggleUserSuspension = async (userId, suspend) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: !suspend },
    { new: true }
  );

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  return user.toSafeObject();
};

/**
 * Delete a user permanently.
 * Prevents self-deletion and deletion of last admin.
 * @param {string} userId
 * @param {string} requestingAdminId
 */
const deleteUser = async (userId, requestingAdminId) => {
  if (userId === requestingAdminId) {
    throw Object.assign(new Error('You cannot delete your own account.'), {
      statusCode: 400,
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  // Prevent deleting the last admin
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      throw Object.assign(
        new Error('Cannot delete the last admin account.'),
        { statusCode: 400 }
      );
    }
  }

  await User.findByIdAndDelete(userId);

  return { id: userId, name: user.name, email: user.email };
};

/**
 * Get recent activity log (recent user registrations + logins).
 * @param {number} limit
 */
const getRecentActivity = async (limit = 20) => {
  const recentUsers = await User.find()
    .select('name email role createdAt lastLogin isActive')
    .sort({ lastLogin: -1, createdAt: -1 })
    .limit(limit);

  return recentUsers.map((u) => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin,
  }));
};

module.exports = {
  getDashboardStats,
  getUserGrowthAnalytics,
  getTopicDistribution,
  getQuizPerformance,
  getUserList,
  updateUserRole,
  toggleUserSuspension,
  deleteUser,
  getRecentActivity,
};
