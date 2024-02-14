const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const loadEnv = require("../env");
loadEnv();

const {
  EMAIL_SERVICE,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_SECURE,
  EMAIL_ID,
  EMAIL_PASS,
  EMAIL_USER,
  SECRET,
  EXPIRY,
} = process.env;

const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_SECURE === "true",
  auth: {
    user: EMAIL_ID,
    pass: EMAIL_PASS,
  },
});

/**
 * Generates a JSON Web Token (JWT) for the given user ID.
 *
 * @param {string} id - User ID.
 * @returns {string} The generated JWT.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, SECRET, {
    expiresIn: EXPIRY,
  });
};

/**
 * Generates a random reset token using crypto.
 *
 * @returns {string} The generated reset token.
 */
const generateResetToken = () => {
  const token = crypto.randomBytes(20).toString("hex");
  return token;
};

/**
 * Sends a password reset email to the provided email address.
 *
 * @async
 * @param {string} email - The email address to which the reset email will be sent.
 * @param {string} resetToken - The reset token to include in the email.
 * @returns {string} A success message if the email is sent.
 * @throws {Error} Throws an error if the email could not be sent.
 */
const sendResetEmail = async (email, resetToken) => {
  const mailOptions = {
    from: {
      name: EMAIL_USER,
      email: EMAIL_ID,
    },
    to: email,
    subject: "Password Reset Request",
    html: `<p>Hey there,</p><p>You requested to change your password.</p><p>Token: ${resetToken} </p><p>Use this token to reset your password.<p/>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { message: "email sent" };
  } catch (err) {
    console.error(err);
    throw new Error("email could not be sent");
  }
};

/**
 * Validates a reset token against a user's stored reset token and expiration date.
 *
 * @param {string} token - The reset token to validate.
 * @param {object} user - The user object containing resetPasswordToken and resetPasswordExpires properties.
 * @returns {boolean} Returns true if the token is valid; otherwise, returns false.
 */
const validateResetToken = (token, user) => {
  return (
    token === user.resetPasswordToken && user.resetPasswordExpires > Date.now()
  );
};

module.exports = {
  generateToken,
  generateResetToken,
  sendResetEmail,
  validateResetToken,
};
