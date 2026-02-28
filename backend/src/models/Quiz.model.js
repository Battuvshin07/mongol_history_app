// ============================================
// Quiz Model
// Quiz questions with multiple choice answers
// Matches Flutter Quiz model structure
// ============================================

const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    quizId: {
      type: Number,
      unique: true,
      required: true,
    },

    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
    },

    answers: {
      type: String, // JSON string: ["Answer 1", "Answer 2", "Answer 3", "Answer 4"]
      required: [true, 'Answers are required'],
    },

    correctAnswer: {
      type: Number, // 0-3 index
      required: [true, 'Correct answer index is required'],
      min: [0, 'Correct answer index must be between 0 and 3'],
      max: [3, 'Correct answer index must be between 0 and 3'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.quiz_id = ret.quizId;
        ret.correct_answer = ret.correctAnswer;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Quiz', quizSchema);
