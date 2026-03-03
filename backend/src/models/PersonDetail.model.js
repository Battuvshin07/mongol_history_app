// ============================================
// PersonDetail Model (1:1 with Person)
// Matches Flutter PersonDetailModel (data/models/person_detail_model.dart)
// Firestore equiv: person_details/{personId}
// Fields: personId, longBio, achievements[], timeline[], sources[], updatedBy
// ============================================

const mongoose = require('mongoose');

const timelineEntrySchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const sourceRefSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const personDetailSchema = new mongoose.Schema(
  {
    personId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      required: [true, 'personId is required'],
      unique: true, // 1:1 relationship
    },

    longBio: {
      type: String,
      required: [true, 'Long bio is required'],
      trim: true,
    },

    achievements: {
      type: [String],
      default: [],
    },

    timeline: {
      type: [timelineEntrySchema],
      default: [],
    },

    sources: {
      type: [sourceRefSchema],
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

personDetailSchema.index({ personId: 1 });

module.exports = mongoose.model('PersonDetail', personDetailSchema);
