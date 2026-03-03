// ============================================
// FamilyTree Model
// Matches Flutter FamilyTreeModel (data/models/family_tree_model.dart)
// Firestore equiv: family_tree/{treeId}
// Fields: title, nodes[], edges[], updatedBy
// ============================================

const mongoose = require('mongoose');

const familyTreeNodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    personId: { type: String, required: true }, // MongoDB ObjectId string ref to Person
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  { _id: false }
);

const familyTreeEdgeSchema = new mongoose.Schema(
  {
    from: { type: String, required: true }, // node id
    to: { type: String, required: true },   // node id
    relationType: {
      type: String,
      required: true,
      // e.g. "parent", "spouse", "child", "sibling"
    },
  },
  { _id: false }
);

const familyTreeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    nodes: {
      type: [familyTreeNodeSchema],
      default: [],
    },

    edges: {
      type: [familyTreeEdgeSchema],
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

familyTreeSchema.index({ title: 'text' });
familyTreeSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('FamilyTree', familyTreeSchema);
