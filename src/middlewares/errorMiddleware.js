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
