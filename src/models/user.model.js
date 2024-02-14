const mongoose = require("mongoose");

/**
 * Mongoose User Schema representing user details.
 *
 * @typedef {Object} User
 * @property {string} firstName - The first name of the user.
 * @property {string} lastName - The last name of the user.
 * @property {string} email - The email address of the user (unique).
 * @property {("admin"|"user")} role - The role of the user, either "admin" or "user" (default: "user").
 * @property {string} password - The password of the user.
 * @property {string} [avatar] - The URL or path to the user's avatar image.
 * @property {string} [resetPasswordToken] - Token for resetting the user's password.
 * @property {Date} [resetPasswordExpires] - Expiration date for the reset password token.
 * @property {Date} createdAt - Timestamp representing the creation date.
 * @property {Date} updatedAt - Timestamp representing the last update date.
 */

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Mongoose model representing a User.
 *
 * @type {mongoose.Model<User>}
 */
const User = mongoose.model("User", userSchema);

module.exports = User;
