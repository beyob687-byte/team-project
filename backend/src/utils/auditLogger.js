const db = require("../db/connection");

function createHttpError(statusCode, code, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  if (details !== undefined) {
    error.details = details;
  }
  return error;
}

async function logAudit(
  {
    universityId,
    actorId = null,
    targetType,
    targetId = null,
    action,
    oldValue = null,
    newValue = null,
    ipAddress,
  },
  client = db,
) {
  if (!universityId) {
    throw createHttpError(
      500,
      "AUDIT_LOG_ERROR",
      "University id is required for audit logging.",
    );
  }

  await client("audit_logs").insert({
    university_id: universityId,
    actor_id: actorId,
    target_type: targetType,
    target_id: targetId,
    action,
    old_value: oldValue,
    new_value: newValue,
    ip_address: ipAddress || "127.0.0.1",
  });
}

module.exports = {
  logAudit,
};
