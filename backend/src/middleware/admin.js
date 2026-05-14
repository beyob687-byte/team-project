module.exports = function adminMiddleware(req, res, next) {
  if (req.userRole === "admin" || req.userRole === "university_admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: {
      code: "FORBIDDEN",
      message: "Admin access is required.",
    },
  });
};
