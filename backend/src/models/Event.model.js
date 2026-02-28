// ============================================
// Event Model
// Historical events tied to persons
// Matches Flutter Event model structure
// ============================================

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    eventId: {
      type: Number,
      unique: true,
      required: true,
    },

    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },

    date: {
      type: String,
      required: [true, 'Event date is required'],
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },

    personId: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.event_id = ret.eventId;
        ret.person_id = ret.personId;
        delete ret.__v;
        return ret;
      },
    },
  }
);

eventSchema.index({ date: 1 });
eventSchema.index({ personId: 1 });

module.exports = mongoose.model('Event', eventSchema);
