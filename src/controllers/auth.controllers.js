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
 * Register a new user.
 *
 * @function
 * @async
 * @name registerUser
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 *
 * @throws {Error} Will throw an error if required fields are not provided,
 *                 if the user already exists, or if registration fails.
 *
 * @description This function handles the registration of a new user.
 *
 * @route {POST} /api/v1/auth/register
 * @access public
 *
 * @param {string} req.body.firstName - First name of the user.
 * @param {string} req.body.lastName - Last name of the user.
 * @param {string} req.body.email - Email address of the user.
 * @param {string} req.body.password - User's password.
 *
 * @returns {void}
 *
 * @example
 * ```
 * app.post('/api/v1/auth/register', registerUser);
 * ```
 */
const registerUser = asyncHandler(async (req, res) => {
  // Extract data from the request body
  const { firstName, lastName, email, password } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error("Fill in all the fields");
  }

  // Check if the user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create a new user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  // Check if user creation was successful
  if (!user) {
    res.status(400);
    throw new Error("Registration failed");
  }

  // Generate a token for the registered user
  const token = generateToken(user._id);

  // Check if token generation was successful
  if (!token) {
    res.status(500);
    throw new Error("Token generation failed");
  }

  // Send a success response with user ID and token
  res.status(201).json({ id: user._id, token });
});

/**
 * Log in a user.
 *
 * @function
 * @async
 * @name loginUser
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 *
 * @throws {Error} Will throw an error if required fields are not provided,
 *                 if the user does not exist, if credentials are invalid,
 *                 or if token generation fails.
 *
 * @description This function handles user login.
 *
 * @route {POST} /api/v1/auth/login
 * @access public
 *
 * @param {string} req.body.email - Email address of the user.
 * @param {string} req.body.password - User's password.
 *
 * @returns {void}
 *
 * @example
 * ```
 * app.post('/api/v1/auth/login', loginUser);
 * ```
 */
const loginUser = asyncHandler(async (req, res) => {
  // Extract data from the request body
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    res.status(400);
    throw new Error("Please fill in all the fields");
  }

  // Find the user by email
  const user = await User.findOne({ email });

  // Check if the user exists
  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  // Compare the provided password with the stored hashed password
  const passwordMatch = await bcrypt.compare(password, user.password);

  // Check if password is correct
  if (!passwordMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  // Generate a token for the logged-in user
  const token = generateToken(user._id);

  // Check if token generation was successful
  if (!token) {
    res.status(500);
    throw new Error("Token generation failed");
  }

  // Send a success response with user ID and token
  res.status(200).json({ id: user._id, token });
});

/**
 * Reset the password for a user.
 *
 * @function
 * @async
 * @name resetPassword
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 *
 * @throws {Error} Will throw an error if the required field is not provided
 *                 or if the user is not found.
 *
 * @description This function handles the reset of a user's password.
 *
 * @route {POST} /api/v1/auth/reset
 * @access public
 *
 * @param {string} req.body.email - Email address of the user.
 *
 * @returns {void}
 *
 * @example
 * ```
 * app.post('/api/v1/auth/reset', resetPassword);
 * ```
 */
const resetPassword = asyncHandler(async (req, res) => {
  // Extract data from the request body
  const { email } = req.body;

  // Validate required fields
  if (!email) {
    res.status(400);
    throw new Error("Please fill in all the fields");
  }

  // Find the user by email
  const user = await User.findOne({ email });

  // Check if the user exists
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  // Generate a reset token and set expiration time
  const resetToken = generateResetToken();
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour

  // Save the updated user information
  await user.save();

  // Send a reset email to the user
  const message = await sendResetEmail(user.email, resetToken);

  // Send a success response with the email message
  res.status(200).json(message);
});

/**
 * Confirm the reset of a user's password.
 *
 * @function
 * @async
 * @name confirmResetPassword
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 *
 * @throws {Error} Will throw an error if required fields are not provided,
 *                 if the token is invalid or expired, or if password reset fails.
 *
 * @description This function confirms the reset of a user's password.
 *
 * @route {POST} /api/v1/auth/reset/:token
 * @access public
 *
 * @param {string} req.params.token - Token from the reset email.
 * @param {string} req.body.newPassword - New password for the user.
 *
 * @returns {void}
 *
 * @example
 * ```
 * app.post('/api/v1/auth/reset/:token', confirmResetPassword);
 * ```
 */
const confirmResetPassword = asyncHandler(async (req, res) => {
  // Extract data from request parameters and body
  const { token } = req.params;
  const { newPassword } = req.body;

  // Validate required fields
  if (!token || !newPassword) {
    res.status(400);
    throw new Error("Please fill in all the fields");
  }

  // Find the user by the reset token and check expiration
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  // Check if the user with the given token exists and is not expired
  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired token");
  }

  // Validate the reset token using a custom function (replace with your implementation)
  if (!validateResetToken(token, user)) {
    res.status(400);
    throw new Error("Invalid token");
  }

  // Generate a salt and hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update user password and reset token information
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  // Save the updated user information
  await user.save();

  // Send a success response
  res.status(200).json({ message: "Password reset successful" });
});

module.exports = confirmResetPassword;

module.exports = {
  registerUser,
  loginUser,
  resetPassword,
  confirmResetPassword,
};
