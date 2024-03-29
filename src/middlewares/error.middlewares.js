/**
 * Express middleware for handling errors and sending an appropriate JSON response with status code.
 *
 * @param {Error} err - The error object.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {object} next - The Express next function.
 * @returns {void}
 *
 * @example
 * ```
 * app.get('/example', (req, res, next) => {
 *   // Some code that may throw an error
 *   errorHandler(new Error('Example error'), req, res, next);
 * });
 * ```
 */

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode || 500;
  const response = {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  };

  res.status(statusCode).json(response);
};

module.exports = {
  errorHandler,
};
