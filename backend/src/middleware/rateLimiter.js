const rateLimit = require("express-rate-limit");

const AUTH_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: {
      code: "AUTH_RATE_LIMITED",
      message: "Too many authentication attempts. Please try again later.",
    },
  },
};

function createAuthRateLimiter() {
  return rateLimit({
    windowMs: AUTH_LIMIT_CONFIG.windowMs,
    max: AUTH_LIMIT_CONFIG.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: AUTH_LIMIT_CONFIG.message,
  });
}

module.exports = {
  createAuthRateLimiter,
};
