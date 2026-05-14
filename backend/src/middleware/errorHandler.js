module.exports = function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || error.status || 500;
  const code =
    error.code ||
    (statusCode === 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR");
  const message = error.message || "Something went wrong.";

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(error.details ? { details: error.details } : {}),
    },
  });
};
