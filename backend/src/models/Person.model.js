// ============================================
// Person Model
// Historical figures from 13th century Mongolia
// Matches Flutter Person model structure
// ============================================

const mongoose = require('mongoose');

const personSchema = new mongoose.Schema(
  {
    personId: {
      type: Number,
      unique: true,
      required: true,
    },

    name: {
      type: String,
      required: [true, 'Person name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },

    birthDate: {
      type: String,
      default: null,
    },

    deathDate: {
      type: String,
      default: null,
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
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        // Map to match Flutter's expected JSON keys
        ret.person_id = ret.personId;
        ret.birth_date = ret.birthDate;
        ret.death_date = ret.deathDate;
        ret.image_url = ret.imageUrl;
        delete ret.__v;
        return ret;
      },
    },
  }
);

personSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Person', personSchema);
