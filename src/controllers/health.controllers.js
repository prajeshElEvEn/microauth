const asyncHandler = require("express-async-handler");

/**
 * @function
 * @async
 * @name onConnect
 * @param {object} req
 * @param {object} res
 * @description checks if server is up
 * @route {GET} /api/v1/health
 * @access public
 */

const onConnect = asyncHandler(async (req, res) => {
  try {
    res.status(200).json({
      status: "online",
      message: "Server is up and running.",
    });
  } catch (error) {
    res.status(500).json({
      status: "offline",
      message: "Server is not running.",
      error,
    });
  }
});

module.exports = {
  onConnect,
};
