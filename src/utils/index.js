const utils = module.exports;
const {
  generateToken,
  generateResetToken,
  sendResetEmail,
  validateResetToken,
} = require("./auth");

utils.loadEnv = require("./env");
utils.connectToDB = require("./db");
utils.generateToken = generateToken;
utils.generateResetToken = generateResetToken;
utils.sendResetEmail = sendResetEmail;
utils.validateResetToken = validateResetToken;
