// ============================================
// Content Model
// Generic content collection for the app
// CRUD operations restricted by role
// ============================================

const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },

    imageUrl: {
      type: String,
      trim: true,
      default: null,
    },

    category: {
      type: String,
      enum: ['general', 'announcement', 'featured', 'news'],
      default: 'general',
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for efficient querying
contentSchema.index({ category: 1, isPublished: 1 });
contentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Content', contentSchema);
