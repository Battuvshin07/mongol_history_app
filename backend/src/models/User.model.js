// ============================================
// User Model
// Handles user accounts with role-based access
// Roles: 'admin' | 'user'
// ============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ROLES, JWT } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },

    role: {
      type: String,
      enum: {
        values: [ROLES.ADMIN, ROLES.USER],
        message: 'Role must be either admin or user',
      },
      default: ROLES.USER,
    },

    displayName: {
      type: String,
      trim: true,
      maxlength: [100, 'Display name cannot exceed 100 characters'],
      default: null,
    },

    photoUrl: {
      type: String,
      default: null,
    },

    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: null,
    },

    preferredLanguage: {
      type: String,
      enum: ['mn', 'en'],
      default: 'mn',
    },

    totalXP: {
      type: Number,
      default: 0,
      min: [0, 'XP cannot be negative'],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// Pre-save Hook: Hash password before saving
// ============================================
userSchema.pre('save', async function (next) {
  // Only hash if password was modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ============================================
// Instance Methods
// ============================================

/**
 * Compare entered password with hashed password in database.
 * @param {string} enteredPassword - Plain text password to compare
 * @returns {Promise<boolean>} True if passwords match
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate a signed JWT token for the user.
 * @returns {string} JWT token
 */
userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      email: this.email,
    },
    JWT.SECRET,
    { expiresIn: JWT.EXPIRE }
  );
};

/**
 * Return user data without sensitive fields.
 * @returns {Object} Sanitized user object
 */
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    displayName: this.displayName,
    email: this.email,
    role: this.role,
    photoUrl: this.photoUrl,
    bio: this.bio,
    preferredLanguage: this.preferredLanguage,
    totalXP: this.totalXP,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('User', userSchema);
