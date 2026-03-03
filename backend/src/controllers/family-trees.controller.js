// ============================================
// FamilyTree Controller
// Matches Flutter FamilyTreeModel: title, nodes[], edges[], updatedBy
// GET    /api/family-trees        - public
// GET    /api/family-trees/:id    - public
// POST   /api/family-trees        - admin
// PATCH  /api/family-trees/:id    - admin
// DELETE /api/family-trees/:id    - admin
// ============================================

const FamilyTree = require('../models/FamilyTree.model');
const { STATUS, PAGINATION } = require('../config/constants');

/**
 * @desc    Get all family trees (paginated, searchable)
 * @route   GET /api/family-trees
 * @access  Public
 */
const getAllFamilyTrees = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(
      parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    const [trees, total] = await Promise.all([
      FamilyTree.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      FamilyTree.countDocuments(filter),
    ]);

    res.status(STATUS.OK).json({
      success: true,
      count: trees.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: { familyTrees: trees },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single family tree
 * @route   GET /api/family-trees/:id
 * @access  Public
 */
const getFamilyTreeById = async (req, res, next) => {
  try {
    const tree = await FamilyTree.findById(req.params.id);

    if (!tree) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Family tree not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      data: { familyTree: tree },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new family tree
 * @route   POST /api/family-trees
 * @access  Private/Admin
 */
const createFamilyTree = async (req, res, next) => {
  try {
    const { title, nodes, edges } = req.body;
    const tree = await FamilyTree.create({
      title,
      nodes: nodes || [],
      edges: edges || [],
      updatedBy: req.user?.id?.toString(),
    });

    res.status(STATUS.CREATED).json({
      success: true,
      message: 'Family tree created successfully.',
      data: { familyTree: tree },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a family tree
 * @route   PATCH /api/family-trees/:id
 * @access  Private/Admin
 */
const updateFamilyTree = async (req, res, next) => {
  try {
    const update = { ...req.body, updatedBy: req.user?.id?.toString() };
    const tree = await FamilyTree.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!tree) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Family tree not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      message: 'Family tree updated successfully.',
      data: { familyTree: tree },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a family tree
 * @route   DELETE /api/family-trees/:id
 * @access  Private/Admin
 */
const deleteFamilyTree = async (req, res, next) => {
  try {
    const tree = await FamilyTree.findByIdAndDelete(req.params.id);

    if (!tree) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: 'Family tree not found.',
      });
    }

    res.status(STATUS.OK).json({
      success: true,
      message: 'Family tree deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFamilyTrees,
  getFamilyTreeById,
  createFamilyTree,
  updateFamilyTree,
  deleteFamilyTree,
};
