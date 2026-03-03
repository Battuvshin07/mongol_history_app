// ============================================
// Story Model (History Journey)
// Matches Flutter Story model (models/story.dart)
// Firestore equiv: stories/{storyId}
// Fields: title, content, order, xpReward, quizId?, imageUrl?, updatedBy
// ============================================

const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },

    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },

    order: {
      type: Number,
      required: [true, 'Order is required'],
      min: [1, 'Order must be at least 1'],
      integer: true,
    },

    xpReward: {
      type: Number,
      required: [true, 'XP reward is required'],
      min: [0, 'XP reward cannot be negative'],
      default: 100,
    },

    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      default: null,
    },

    imageUrl: {
      type: String,
      default: null,
    },

    updatedBy: {
      type: String,
      default: null,
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

storySchema.index({ order: 1 });
storySchema.index({ title: 'text' });
storySchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Story', storySchema);
