const db = require("../db/connection");

function createHttpError(statusCode, code, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

const PERMISSION_ROLE_MAP = {
  manage_projects: ["president", "vice_president", "secretary"],
  create_surveys: [
    "president",
    "vice_president",
    "secretary",
    "event_coordinator",
  ],
  view_survey_responses: [
    "president",
    "vice_president",
    "secretary",
    "event_coordinator",
  ],
};

function resolveAllowedRoles(requiredRolesOrPermission) {
  if (!requiredRolesOrPermission) {
    return [];
  }

  if (typeof requiredRolesOrPermission === "string") {
    return PERMISSION_ROLE_MAP[requiredRolesOrPermission] || [requiredRolesOrPermission];
  }

  if (Array.isArray(requiredRolesOrPermission)) {
    return requiredRolesOrPermission;
  }

  return [];
}

function clubRoleMiddleware(requiredRolesOrPermission = []) {
  const resolvedRoles = resolveAllowedRoles(requiredRolesOrPermission);

  return async function requireClubRole(req, res, next) {
    try {
      const clubId = req.params.clubId;
      if (!clubId) {
        throw createHttpError(400, "BAD_REQUEST", "clubId is required.");
      }

      const membership = await db("club_memberships as cm")
        .select(
          "cm.id",
          "cm.user_id",
          "cm.club_id",
          "cm.role",
          "cm.status",
          "cm.join_date",
          "cm.left_date",
        )
        .join("clubs as c", "c.id", "cm.club_id")
        .where({
          "cm.user_id": req.userId,
          "cm.club_id": clubId,
          "cm.status": "active",
          "c.university_id": req.universityId,
        })
        .first();

      if (!membership) {
        throw createHttpError(
          403,
          "FORBIDDEN",
          "You are not a member of this club.",
        );
      }

      if (resolvedRoles.length > 0 && !resolvedRoles.includes(membership.role)) {
        throw createHttpError(
          403,
          "FORBIDDEN",
          "You do not have permission to access this club resource.",
        );
      }

      req.membership = membership;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = clubRoleMiddleware;
