const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
// const loadEnv = require("../env");
// loadEnv();

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

const generateToken = (id) => {
  return jwt.sign({ id }, SECRET, {
    expiresIn: EXPIRY,
  });
};

const generateResetToken = () => {
  const token = crypto.randomBytes(20).toString("hex");
  return token;
};

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
    console.log(err);
    throw new Error("email could not be sent");
  }
};

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
