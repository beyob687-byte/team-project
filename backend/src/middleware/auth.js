const jwt = require("jsonwebtoken");
const appConfig = require("../config");

function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

module.exports = function authMiddleware(req, res, next) {
  try {
    const token =
      req.cookies?.accessToken || extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required.",
        },
      });
    }

    const decoded = jwt.verify(token, appConfig.jwt.accessSecret);

    req.userId = decoded.userId;
    req.universityId = decoded.universityId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;
    req.auth = decoded;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or expired access token.",
      },
    });
  }
};
