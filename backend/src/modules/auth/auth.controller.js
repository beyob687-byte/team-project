const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const appConfig = require("../../config");
const db = require("../../db/connection");
const { loginSchema, signupSchema } = require("./auth.validation");

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

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function createHttpError(statusCode, code, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  if (details) {
    error.details = details;
  }
  return error;
}

function extractDomain(email) {
  const parts = String(email).toLowerCase().split("@");
  return parts.length === 2 ? parts[1] : null;
}

function stripUserSecrets(user) {
  if (!user) {
    return null;
  }

  const { password_hash, ...safeUser } = user;
  return safeUser;
}

function issueAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      universityId: user.university_id,
      email: user.email,
      role: user.user_type,
    },
    appConfig.jwt.accessSecret,
    {
      expiresIn: appConfig.jwt.accessExpires,
    },
  );
}

function issueRefreshToken(userId) {
  const tokenId = uuidv4();
  const token = jwt.sign(
    {
      userId,
      tokenId,
    },
    appConfig.jwt.refreshSecret,
    {
      expiresIn: appConfig.jwt.refreshExpires,
    },
  );

  return { token, tokenId };
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: appConfig.cookie.secure,
    sameSite: appConfig.cookie.sameSite,
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: appConfig.cookie.secure,
    sameSite: appConfig.cookie.sameSite,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    path: "/api/v1/auth/refresh",
  });
}

function clearAuthCookies(res) {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/api/v1/auth/refresh" });
}

function formatValidationIssues(issues) {
  return issues.map((issue) => issue.message).join(" ");
}

exports.signup = async function signup(req, res, next) {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createHttpError(
        400,
        "VALIDATION_ERROR",
        formatValidationIssues(parsed.error.issues),
      );
    }

    const { email, password, first_name, last_name, student_id, interests } =
      parsed.data;
    const domain = extractDomain(email);

    if (!domain) {
      throw createHttpError(
        400,
        "INVALID_EMAIL_DOMAIN",
        "Please provide a valid institutional email address.",
      );
    }

    const university = await db("universities")
      .whereRaw("LOWER(domain) = ?", [domain])
      .andWhere({ active: true })
      .first();

    if (!university) {
      throw createHttpError(
        400,
        "UNIVERSITY_DOMAIN_NOT_FOUND",
        "Your email domain is not associated with any registered university. Please use your institutional email.",
      );
    }

    const existingUser = await db("users")
      .where({ university_id: university.id, email })
      .first();

    if (existingUser) {
      throw createHttpError(409, "USER_ALREADY_EXISTS", "User already exists");
    }

    const passwordHash = await bcrypt.hash(password, appConfig.bcryptRounds);
    const insertedRows = await db("users")
      .insert({
        university_id: university.id,
        email,
        password_hash: passwordHash,
        first_name,
        last_name,
        student_id: student_id || null,
        user_type: "student",
        interests: interests && interests.length ? interests : null,
        notification_preferences: {
          email: true,
          in_app: true,
          digest: "weekly",
        },
        is_active: true,
      })
      .returning(USER_SELECT_COLUMNS);

    const user = insertedRows[0];
    const accessToken = issueAccessToken(user);
    const { token: refreshToken } = issueRefreshToken(user.id);

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      success: true,
      data: {
        user: stripUserSecrets(user),
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.login = async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createHttpError(
        400,
        "VALIDATION_ERROR",
        formatValidationIssues(parsed.error.issues),
      );
    }

    const { email, password } = parsed.data;
    const domain = extractDomain(email);

    if (!domain) {
      throw createHttpError(401, "INVALID_CREDENTIALS", "Invalid credentials");
    }

    const university = await db("universities")
      .whereRaw("LOWER(domain) = ?", [domain])
      .andWhere({ active: true })
      .first();

    if (!university) {
      throw createHttpError(401, "INVALID_CREDENTIALS", "Invalid credentials");
    }

    const user = await db("users")
      .select(USER_SELECT_COLUMNS.concat(["password_hash"]))
      .where({ university_id: university.id, email, is_active: true })
      .first();

    if (!user || !user.password_hash) {
      throw createHttpError(401, "INVALID_CREDENTIALS", "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw createHttpError(401, "INVALID_CREDENTIALS", "Invalid credentials");
    }

    const accessToken = issueAccessToken(user);
    const { token: refreshToken } = issueRefreshToken(user.id);

    await db("users")
      .where({ id: user.id })
      .update({ last_login: db.fn.now() });

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      data: {
        user: stripUserSecrets(user),
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.refresh = async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      throw createHttpError(401, "UNAUTHORIZED", "Refresh token is required.");
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, appConfig.jwt.refreshSecret);
    } catch (error) {
      throw createHttpError(
        401,
        "UNAUTHORIZED",
        "Invalid or expired refresh token.",
      );
    }

    const user = await db("users")
      .select(USER_SELECT_COLUMNS)
      .where({ id: decoded.userId, is_active: true })
      .first();

    if (!user) {
      throw createHttpError(
        401,
        "UNAUTHORIZED",
        "Invalid or expired refresh token.",
      );
    }

    const { token: newRefreshToken } = issueRefreshToken(user.id);
    const accessToken = issueAccessToken(user);
    setAuthCookies(res, accessToken, newRefreshToken);

    return res.status(200).json({
      success: true,
      data: {
        user: stripUserSecrets(user),
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.logout = async function logout(req, res, next) {
  try {
    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      data: {
        message: "Logged out successfully.",
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.me = async function me(req, res, next) {
  try {
    const user = await db("users")
      .select(USER_SELECT_COLUMNS)
      .where({ id: req.userId })
      .first();

    if (!user) {
      throw createHttpError(404, "USER_NOT_FOUND", "User not found");
    }

    return res.status(200).json({
      success: true,
      data: {
        user: user,
      },
    });
  } catch (error) {
    return next(error);
  }
};
