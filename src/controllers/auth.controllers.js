const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const {
  generateToken,
  generateResetToken,
  sendResetEmail,
  validateResetToken,
} = require("../utils");

/**
 * @function
 * @async
 * @name registerUser
 * @param {object} req
 * @param {object} res
 * @description Register user
 * @route {POST} /api/v1/auth/register
 * @access public
 */

const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error("Fill in all the fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  if (!user) {
    res.status(400);
    throw new Error("registration failed");
  }

  const token = generateToken(user._id);

  if (!token) {
    res.status(500);
    throw new Error("token generation failed");
  }

  res.status(201).json({ id: user._id, token });
});

/**
 * @function
 * @async
 * @name loginUser
 * @param {object} req
 * @param {object} res
 * @description Register user
 * @route {POST} /api/v1/auth/login
 * @access public
 */

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("please fill in all the fields");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("invalid credentials");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user._id);

  if (!token) {
    res.status(500);
    throw new Error("Token generation failed");
  }

  res.status(200).json({ id: user._id, token });
});

/**
 * @function
 * @async
 * @name resetPassword
 * @param {object} req
 * @param {object} res
 * @description Reset password
 * @route {POST} /api/v1/auth/reset
 * @access public
 */

const resetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Please fill in all the fields");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const resetToken = generateResetToken();

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000;

  await user.save();

  const message = await sendResetEmail(user.email, resetToken);

  res.status(200).json(message);
});

/**
 * @function
 * @async
 * @name resetPassword
 * @param {object} req
 * @param {object} res
 * @description Confirm reset password
 * @route {POST} /api/v1/auth/reset/:token
 * @access public
 */

const confirmResetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400);
    throw new Error("Please fill in all the fields");
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired token");
  }

  if (!validateResetToken(token, user)) {
    res.status(400);
    throw new Error("Invalid token");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.status(200).json({ message: "Password reset successful" });
});

module.exports = {
  registerUser,
  loginUser,
  resetPassword,
  confirmResetPassword,
};
