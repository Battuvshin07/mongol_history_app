// ============================================
// Video Model
// Matches Flutter VideoModel (data/models/video_model.dart)
// Fields: youtubeId, title, subtitle, duration, iconName, accentHex,
//         order, isPublished, updatedBy
// ============================================

const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    youtubeId: {
      type: String,
      required: [true, 'YouTube video ID is required'],
      trim: true,
      maxlength: [20, 'YouTube ID cannot exceed 20 characters'],
    },

    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },

    subtitle: {
      type: String,
      default: '',
      trim: true,
    },

    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
    },

    iconName: {
      type: String,
      default: 'video_library',
      trim: true,
    },

    accentHex: {
      type: String,
      default: 'F4C84A',
      trim: true,
      match: [/^[0-9A-Fa-f]{6}$/, 'accentHex must be a 6-char hex string'],
    },

    order: {
      type: Number,
      default: 0,
      min: [0, 'Order must be a non-negative integer'],
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    updatedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient ordering
videoSchema.index({ order: 1, isPublished: 1 });

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
