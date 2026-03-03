// ============================================
// Progress Controller (per-user per-story)
// Matches Flutter UserStoryProgress: studied, quizPassed, xpEarned
// GET  /api/progress/me                         - auth user
// POST /api/progress/:storyId/mark-studied      - auth user
// POST /api/progress/:storyId/submit-quiz       - auth user { score, total }
//
// Business rules:
//   - Must have studied=true before quiz can be submitted
//   - Pass threshold: score/total >= 0.7
//   - XP added to user.totalXP only once (first passing attempt)
//   - Unlock = previous story in order has quizPassed == true
// ============================================

const Progress = require('../models/Progress.model');
const Story = require('../models/Story.model');
const User = require('../models/User.model');
const { STATUS } = require('../config/constants');

/**
 * @desc    Get current user's progress for all stories
 * @route   GET /api/progress/me
 * @access  Private (auth)
 */
const getMyProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all stories ordered by their story order
    const stories = await Story.find().sort({ order: 1 }).select('_id order title xpReward');
    const progressDocs = await Progress.find({ userId });

    const progressMap = {};
    for (const p of progressDocs) {
      progressMap[p.storyId.toString()] = p;
    }

    // Compute unlock status
    const result = stories.map((story, idx) => {
      const prog = progressMap[story._id.toString()];
      const prevStory = idx > 0 ? stories[idx - 1] : null;
      const unlocked =
        idx === 0 ||
        (prevStory && progressMap[prevStory._id.toString()]?.quizPassed === true);

      return {
        storyId: story._id,
        storyTitle: story.title,
        storyOrder: story.order,
        xpReward: story.xpReward,
        studied: prog?.studied ?? false,
        quizPassed: prog?.quizPassed ?? false,
        xpEarned: prog?.xpEarned ?? 0,
        unlocked,
      };
    });

    const user = await User.findById(userId).select('totalXP');

    res.status(STATUS.OK).json({
      success: true,
      data: {
        totalXP: user?.totalXP ?? 0,
        progress: result,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a story as studied
 * @route   POST /api/progress/:storyId/mark-studied
 * @access  Private (auth)
 */
const markStudied = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    // Verify story exists
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Story not found.',
      });
    }

    const progress = await Progress.findOneAndUpdate(
      { userId, storyId },
      { $set: { studied: true } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(STATUS.OK).json({
      success: true,
      message: 'Story marked as studied.',
      data: {
        progress: {
          storyId,
          studied: progress.studied,
          quizPassed: progress.quizPassed,
          xpEarned: progress.xpEarned,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit quiz result for a story
 * @route   POST /api/progress/:storyId/submit-quiz
 * @access  Private (auth)
 * @body    { score: number, total: number }
 */
const submitQuiz = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;
    const { score, total } = req.body;

    if (score === undefined || total === undefined || total <= 0) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: 'score and total (> 0) are required.',
      });
    }

    // Verify story exists
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Story not found.',
      });
    }

    // Check that user has studied the story first
    const existing = await Progress.findOne({ userId, storyId });
    if (!existing?.studied) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: 'You must study the story before submitting the quiz.',
      });
    }

    const PASS_THRESHOLD = 0.7;
    const passed = score / total >= PASS_THRESHOLD;
    const alreadyEarned = (existing?.xpEarned ?? 0) > 0;
    const xpToAward = passed && !alreadyEarned ? story.xpReward : 0;

    const updateData = {
      studied: true,
    };
    if (passed) {
      updateData.quizPassed = true;
      updateData.xpEarned = alreadyEarned ? existing.xpEarned : story.xpReward;
    }

    const [progress] = await Promise.all([
      Progress.findOneAndUpdate(
        { userId, storyId },
        { $set: updateData },
        { new: true, upsert: true }
      ),
      // Award XP once
      xpToAward > 0
        ? User.findByIdAndUpdate(userId, { $inc: { totalXP: xpToAward } })
        : Promise.resolve(),
    ]);

    res.status(STATUS.OK).json({
      success: true,
      message: passed ? 'Quiz passed!' : 'Quiz failed. Try again.',
      data: {
        passed,
        score,
        total,
        percentage: Math.round((score / total) * 100),
        xpEarned: xpToAward,
        progress: {
          storyId,
          studied: progress.studied,
          quizPassed: progress.quizPassed,
          xpEarned: progress.xpEarned,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProgress,
  markStudied,
  submitQuiz,
};
