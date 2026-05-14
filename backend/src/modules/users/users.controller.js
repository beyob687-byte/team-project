const db = require("../../db/connection");
const {
  updatePreferencesSchema,
  updateProfileSchema,
} = require("./users.validation");

const USER_SELECT_COLUMNS = [
  "id",
  "university_id",
  "email",
  "first_name",
  "last_name",
  "student_id",
  "user_type",
  "major",
  "department",
  "profile_image_url",
  "bio",
  "interests",
  "notification_preferences",
  "is_active",
  "created_at",
  "last_login",
];

function createHttpError(statusCode, code, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  if (details) {
    error.details = details;
  }
  return error;
}

function formatValidationIssues(issues) {
  return issues.map((issue) => issue.message).join(" ");
}

function ensureSelfAccess(req) {
  if (String(req.userId) !== String(req.params.id)) {
    throw createHttpError(
      403,
      "FORBIDDEN",
      "You can only manage your own profile.",
    );
  }
}

exports.getProfile = async function getProfile(req, res, next) {
  try {
    ensureSelfAccess(req);

    const user = await db("users")
      .select(USER_SELECT_COLUMNS)
      .where({ id: req.params.id })
      .first();

    if (!user) {
      throw createHttpError(404, "USER_NOT_FOUND", "User not found");
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateProfile = async function updateProfile(req, res, next) {
  try {
    ensureSelfAccess(req);

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createHttpError(
        400,
        "VALIDATION_ERROR",
        formatValidationIssues(parsed.error.issues),
      );
    }

    const updateData = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw createHttpError(
        400,
        "VALIDATION_ERROR",
        "No valid profile fields were provided.",
      );
    }

    const updatedRows = await db("users")
      .where({ id: req.userId })
      .update(updateData)
      .returning(USER_SELECT_COLUMNS);

    return res.status(200).json({
      success: true,
      data: {
        user: updatedRows[0],
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.updatePreferences = async function updatePreferences(req, res, next) {
  try {
    ensureSelfAccess(req);

    const parsed = updatePreferencesSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createHttpError(
        400,
        "VALIDATION_ERROR",
        formatValidationIssues(parsed.error.issues),
      );
    }

    const updatedRows = await db("users")
      .where({ id: req.userId })
      .update({
        notification_preferences: parsed.data.notification_preferences,
      })
      .returning(["id", "notification_preferences"]);

    return res.status(200).json({
      success: true,
      data: {
        id: updatedRows[0].id,
        notification_preferences: updatedRows[0].notification_preferences,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteAccount = async function deleteAccount(req, res, next) {
  try {
    ensureSelfAccess(req);

    await db("users").where({ id: req.userId }).update({
      is_active: false,
    });

    return res.status(200).json({
      success: true,
      data: {
        message: "Account deactivated successfully.",
      },
    });
  } catch (error) {
    return next(error);
  }
};
