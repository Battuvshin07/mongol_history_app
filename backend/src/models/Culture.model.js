// ============================================
// Culture Model
// Matches Flutter CultureModel (data/models/culture_model.dart)
// Fields: title, description, coverImageUrl, order, updatedBy
// ============================================

const mongoose = require('mongoose');

const cultureSchema = new mongoose.Schema(
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

    coverImageUrl: {
      type: String,
      default: null,
    },

    order: {
      type: Number,
      default: 0,
      min: [0, 'Order must be a non-negative integer'],
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

cultureSchema.index({ title: 'text', description: 'text' });
cultureSchema.index({ order: 1 });
cultureSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Culture', cultureSchema);
