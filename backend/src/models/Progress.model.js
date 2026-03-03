// ============================================
// Progress Model (per-user per-story)
// Matches Flutter UserStoryProgress (models/story.dart)
// Firestore equiv: users/{uid}/progress/{storyId}
// Fields: userId, storyId, studied, quizPassed, xpEarned
// ============================================

const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },

    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
      required: [true, 'storyId is required'],
    },

    studied: {
      type: Boolean,
      default: false,
    },

    quizPassed: {
      type: Boolean,
      default: false,
    },

    xpEarned: {
      type: Number,
      default: 0,
      min: [0, 'xpEarned cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Compound unique index: one progress doc per user per story
progressSchema.index({ userId: 1, storyId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
