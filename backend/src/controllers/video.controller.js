// ============================================
// Video Controller
// CRUD for history video playlist data
// Admin: Create, Update, Delete
// Public: Read (published only)
// ============================================

const Video = require('../models/Video.model');
const { STATUS, PAGINATION } = require('../config/constants');

/**
 * @desc    Get all published videos (ordered, paginated)
 * @route   GET /api/videos
 * @access  Public
 */
const getAllVideos = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(
      parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { subtitle: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Video.find(filter).sort({ order: 1 }).skip(skip).limit(limit),
      Video.countDocuments(filter),
    ]);

    res.status(STATUS.OK).json({
      success: true,
      count: items.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: { videos: items },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single video
 * @route   GET /api/videos/:id
 * @access  Public
 */
const getVideoById = async (req, res, next) => {
  try {
    const item = await Video.findById(req.params.id);

    if (!item) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Video not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      data: { video: item },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create video (admin)
 * @route   POST /api/videos
 * @access  Private/Admin
 */
const createVideo = async (req, res, next) => {
  try {
    const {
      youtubeId,
      title,
      subtitle,
      duration,
      iconName,
      accentHex,
      order,
      isPublished,
    } = req.body;

    const item = await Video.create({
      youtubeId,
      title,
      subtitle: subtitle || '',
      duration,
      iconName: iconName || 'video_library',
      accentHex: accentHex || 'F4C84A',
      order: order ?? 0,
      isPublished: isPublished !== undefined ? isPublished : true,
      updatedBy: req.user?.id?.toString(),
    });

    res.status(STATUS.CREATED).json({
      success: true,
      message: 'Video created successfully.',
      data: { video: item },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update video (admin)
 * @route   PATCH /api/videos/:id
 * @access  Private/Admin
 */
const updateVideo = async (req, res, next) => {
  try {
    const update = { ...req.body, updatedBy: req.user?.id?.toString() };
    const item = await Video.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Video not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      message: 'Video updated successfully.',
      data: { video: item },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete video (admin)
 * @route   DELETE /api/videos/:id
 * @access  Private/Admin
 */
const deleteVideo = async (req, res, next) => {
  try {
    const item = await Video.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Video not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      message: 'Video deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
};
