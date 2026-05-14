const db = require("../db/connection");

/**
 * Middleware for public routes that need university context.
 * Extracts university ID from a header or defaults to the first available university.
 */
module.exports = async (req, res, next) => {
  try {
    // Try to get university from header first
    const universityHeader = req.headers["x-university-id"];
    if (universityHeader) {
      req.universityId = universityHeader;
      return next();
    }

    // Default to the first/primary university (AAU)
    // In a multi-tenant system, this could be determined by the domain
    const defaultUniversity = await db("universities")
      .where({ domain: "aau.edu.et" })
      .first();

    if (defaultUniversity) {
      req.universityId = defaultUniversity.id;
    } else {
      // Fallback to first university in database
      const firstUniversity = await db("universities").first();
      if (firstUniversity) {
        req.universityId = firstUniversity.id;
      }
    }

    next();
  } catch (error) {
    console.error("Error in publicTenant middleware:", error);
    // Continue without university ID - endpoint will handle the error
    next();
  }
};
