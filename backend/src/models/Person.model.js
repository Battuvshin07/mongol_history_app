// ============================================
// Person Model
// Matches Flutter admin PersonModel (data/models/person_model.dart)
// Fields: name, birthYear, deathYear, shortBio, avatarUrl, tags[], updatedBy
// ============================================

const mongoose = require('mongoose');

const personSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Person name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },

    birthYear: {
      type: Number,
      default: null,
    },

    deathYear: {
      type: Number,
      default: null,
    },

    shortBio: {
      type: String,
      required: [true, 'Short bio is required'],
      trim: true,
    },

    avatarUrl: {
      type: String,
      default: null,
    },

    title: {
      type: String,
      default: null,
      trim: true,
    },

    fatherId: {
      type: String,
      default: null,
    },

    motherId: {
      type: String,
      default: null,
    },

    tags: {
      type: [String],
      default: [],
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

personSchema.index({ name: 'text', shortBio: 'text' });
personSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Person', personSchema);
