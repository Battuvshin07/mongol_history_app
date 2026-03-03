// ============================================
// PersonDetail Controller (1:1 with Person)
// Matches Flutter PersonDetailModel: longBio, achievements[],
//   timeline[{year,text}], sources[{title,url}], updatedBy
// GET    /api/person-details/:personId  - public
// PUT    /api/person-details/:personId  - admin (upsert)
// DELETE /api/person-details/:personId  - admin
// ============================================

const PersonDetail = require('../models/PersonDetail.model');
const Person = require('../models/Person.model');
const { STATUS } = require('../config/constants');

/**
 * @desc    Get PersonDetail for a person
 * @route   GET /api/person-details/:personId
 * @access  Public
 */
const getPersonDetail = async (req, res, next) => {
  try {
    const detail = await PersonDetail.findOne({ personId: req.params.personId });

    if (!detail) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Person detail not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      data: { personDetail: detail },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upsert PersonDetail for a person
 * @route   PUT /api/person-details/:personId
 * @access  Private/Admin
 */
const upsertPersonDetail = async (req, res, next) => {
  try {
    const { personId } = req.params;

    // Validate that the person exists
    const person = await Person.findById(personId);
    if (!person) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Person not found.',
      });
    }

    const { longBio, achievements, timeline, sources } = req.body;

    const detail = await PersonDetail.findOneAndUpdate(
      { personId },
      {
        personId,
        longBio,
        achievements: achievements || [],
        timeline: timeline || [],
        sources: sources || [],
        updatedBy: req.user?.id?.toString(),
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(STATUS.OK).json({
      success: true,
      message: 'Person detail saved successfully.',
      data: { personDetail: detail },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete PersonDetail for a person
 * @route   DELETE /api/person-details/:personId
 * @access  Private/Admin
 */
const deletePersonDetail = async (req, res, next) => {
  try {
    const detail = await PersonDetail.findOneAndDelete({ personId: req.params.personId });

    if (!detail) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Person detail not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      message: 'Person detail deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPersonDetail,
  upsertPersonDetail,
  deletePersonDetail,
};
