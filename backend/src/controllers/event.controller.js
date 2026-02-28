// ============================================
// Event Controller
// CRUD for historical events
// Admin: Create, Update, Delete
// Public: Read
// ============================================

const Event = require('../models/Event.model');
const { STATUS, PAGINATION } = require('../config/constants');

/**
 * @desc    Get all events (with pagination, filtering by personId)
 * @route   GET /api/events
 * @access  Public
 */
const getAllEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(
      parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.personId) {
      filter.personId = parseInt(req.query.personId);
    }

    const [events, total] = await Promise.all([
      Event.find(filter).sort({ date: 1 }).skip(skip).limit(limit),
      Event.countDocuments(filter),
    ]);

    res.status(STATUS.OK).json({
      success: true,
      count: events.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: { events },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single event by eventId
 * @route   GET /api/events/:eventId
 * @access  Public
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findOne({ eventId: parseInt(req.params.eventId) });

    if (!event) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Event not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Private/Admin
 */
const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create(req.body);

    res.status(STATUS.CREATED).json({
      success: true,
      message: 'Event created successfully.',
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an event
 * @route   PUT /api/events/:eventId
 * @access  Private/Admin
 */
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndUpdate(
      { eventId: parseInt(req.params.eventId) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Event not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      message: 'Event updated successfully.',
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an event
 * @route   DELETE /api/events/:eventId
 * @access  Private/Admin
 */
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndDelete({
      eventId: parseInt(req.params.eventId),
    });

    if (!event) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Event not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      message: 'Event deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
