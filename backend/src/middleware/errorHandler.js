module.exports = function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  // correlation id for easier tracking in logs and client support
  const correlationId =
    req.headers["x-correlation-id"] ||
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  // log full error server-side for debugging
  console.error(`[Error][${correlationId}]`, error && (error.stack || error));

  const statusCode = error.statusCode || error.status || 500;
  const code =
    error.code ||
    (statusCode === 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR");
  const message =
    statusCode === 500
      ? "An internal server error occurred."
      : error.message || "Something went wrong.";

  const payload = {
    success: false,
    error: {
      code,
      message,
      correlationId,
      ...(error.details ? { details: error.details } : {}),
    },
  };

  // include stack and original error only in non-production for debugging
  if (process.env.NODE_ENV !== "production") {
    payload.error.stack = error.stack;
    if (error.original) payload.error.original = error.original;
  }

  return res.status(statusCode).json(payload);
};
