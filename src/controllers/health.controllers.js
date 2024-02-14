const asyncHandler = require("express-async-handler");

/**
 * Handle the connection status request.
 *
 * @function
 * @async
 * @name onConnect
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 *
 * @throws {Error} Will throw an error if there's an issue handling the connection status.
 *
 * @description Responds with the server's connection status.
 *
 * @route {GET} /api/v1/connect
 * @access public
 *
 * @returns {void}
 *
 * @example
 * ```
 * app.get('/api/v1/connect', onConnect);
 * ```
 */
const onConnect = asyncHandler(async (req, res) => {
  try {
    // Send a success response with the server's online status
    res.status(200).json({
      status: "online",
      message: "Server is up and running.",
    });
  } catch (error) {
    // Handle errors and send an error response
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
