// ============================================
// Culture Model
// Cultural information and traditions
// ============================================

const mongoose = require('mongoose');

const cultureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },

    imageUrl: {
      type: String,
      default: null,
    },

    category: {
      type: String,
      default: 'general',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.image_url = ret.imageUrl;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Culture', cultureSchema);
