// ============================================
// Data Service
// Common data access patterns
// ============================================

const Person = require('../models/Person.model');
const Event = require('../models/Event.model');
const Quiz = require('../models/Quiz.model');
const Culture = require('../models/Culture.model');

/**
 * Get dashboard statistics (admin).
 * Returns counts of all main collections.
 */
const getDashboardStats = async () => {
  const [personCount, eventCount, quizCount, cultureCount] = await Promise.all([
    Person.countDocuments(),
    Event.countDocuments(),
    Quiz.countDocuments(),
    Culture.countDocuments(),
  ]);

  return {
    persons: personCount,
    events: eventCount,
    quizzes: quizCount,
    culture: cultureCount,
    total: personCount + eventCount + quizCount + cultureCount,
  };
};

/**
 * Get events associated with a specific person.
 * @param {number} personId
 * @returns {Promise<Event[]>}
 */
const getEventsForPerson = async (personId) => {
  return await Event.find({ personId }).sort({ date: 1 });
};

/**
 * Search across persons and events.
 * @param {string} query - Search term
 * @returns {Promise<Object>} Combined search results
 */
const globalSearch = async (query) => {
  const regex = new RegExp(query, 'i');

  const [persons, events] = await Promise.all([
    Person.find({
      $or: [{ name: regex }, { description: regex }],
    }).limit(10),
    Event.find({
      $or: [{ title: regex }, { description: regex }],
    }).limit(10),
  ]);

  return { persons, events };
};

module.exports = {
  getDashboardStats,
  getEventsForPerson,
  globalSearch,
};
