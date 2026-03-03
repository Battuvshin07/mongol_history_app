// ============================================
// Quiz Model (Admin/Full)
// Matches Flutter admin QuizModel (data/models/quiz_model.dart)
// Fields: title, description, difficulty, topic, isPublished,
//         questions[{id,question,options[4],correctIndex,explanation}], updatedBy
// ============================================

const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, 'Question id is required'],
    },
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    options: {
      type: [String],
      validate: {
        validator: (arr) => arr.length === 4,
        message: 'Each question must have exactly 4 options',
      },
    },
    correctIndex: {
      type: Number,
      required: true,
      min: [0, 'correctIndex must be 0-3'],
      max: [3, 'correctIndex must be 0-3'],
    },
    explanation: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'Difficulty must be easy, medium, or hard',
      },
      default: 'easy',
    },

    topic: {
      type: String,
      trim: true,
      default: '',
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    questions: {
      type: [quizQuestionSchema],
      default: [],
    },

    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
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

quizSchema.index({ title: 'text', topic: 'text' });
quizSchema.index({ isPublished: 1 });
quizSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Quiz', quizSchema);
