const db = require("../../db/connection");
const { logAudit } = require("../../utils/auditLogger");
const {
  adminClubListQuerySchema,
  adminClubParamsSchema,
  adminClubStatusSchema,
  adminClubRegistrationQuerySchema,
  adminClubRegistrationDecisionSchema,
  adminUserListQuerySchema,
  adminUserParamsSchema,
  adminUserStatusSchema,
} = require("./admin.validation");

function createHttpError(statusCode, code, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  if (details !== undefined) {
    error.details = details;
  }
  return error;
}

function parseCount(value) {
  if (Array.isArray(value)) {
    return Number(value[0] ?? 0);
  }

  return Number(value ?? 0);
}

function formatName(user) {
  return [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
}

function getMonthWindow(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

function applySearchFilter(query, alias, search) {
  if (!search) {
    return query;
  }

  const searchTerm = `%${search}%`;
  return query.whereRaw(
    `(?? ILIKE ? OR ?? ILIKE ? OR EXISTS (SELECT 1 FROM unnest(COALESCE(??, ARRAY[]::text[])) tag WHERE tag ILIKE ?))`,
    [
      `${alias}.name`,
      searchTerm,
      `${alias}.short_name`,
      searchTerm,
      `${alias}.tags`,
      searchTerm,
    ],
  );
}

async function fetchClubOrThrow(universityId, clubId) {
  const club = await db("clubs")
    .where({ id: clubId, university_id: universityId })
    .first();

  if (!club) {
    throw createHttpError(404, "CLUB_NOT_FOUND", "Club not found.");
  }

  return club;
}

exports.getDashboard = async function getDashboard(req, res) {
  const { start, end } = getMonthWindow();

  const [
    activeClubsRow,
    membershipsRow,
    eventsRow,
    registrationsRow,
    recentClubs,
  ] = await Promise.all([
    db("clubs")
      .where({ university_id: req.universityId, status: "active" })
      .count("* as count")
      .first(),
    db("club_memberships as cm")
      .join("clubs as c", "c.id", "cm.club_id")
      .where({ "c.university_id": req.universityId, "cm.status": "active" })
      .count("* as count")
      .first(),
    db("events as e")
      .join("clubs as c", "c.id", "e.club_id")
      .where("c.university_id", req.universityId)
      .andWhere("e.start_datetime", ">=", start)
      .andWhere("e.start_datetime", "<", end)
      .count("* as count")
      .first(),
    db("club_registration_requests as r")
      .join("clubs as c", "c.id", "r.club_id")
      .where({ "c.university_id": req.universityId, "r.status": "pending" })
      .count("* as count")
      .first(),
    db("clubs")
      .select("id", "name", "logo_url", "status", "created_at")
      .where({ university_id: req.universityId })
      .orderBy("created_at", "desc")
      .limit(5),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      total_clubs: parseCount(activeClubsRow?.count),
      total_memberships: parseCount(membershipsRow?.count),
      total_events_this_month: parseCount(eventsRow?.count),
      pending_registration_requests: parseCount(registrationsRow?.count),
      recent_clubs: recentClubs,
    },
  });
};

exports.listClubs = async function listClubs(req, res) {
  const parsed = adminClubListQuerySchema.parse(req.query);
  const { page, limit, status, category, search, sortBy } = parsed;
  const offset = (page - 1) * limit;

  let baseQuery = db("clubs as c").where("c.university_id", req.universityId);

  if (status) {
    baseQuery = baseQuery.andWhere("c.status", status);
  }

  if (category) {
    baseQuery = baseQuery.andWhereRaw("LOWER(c.category) = ?", [
      category.toLowerCase(),
    ]);
  }

  baseQuery = applySearchFilter(baseQuery, "c", search);

  const totalRow = await baseQuery
    .clone()
    .countDistinct({ total: "c.id" })
    .first();
  const total = parseCount(totalRow?.total);

  let clubsQuery = baseQuery
    .clone()
    .select(
      "c.id",
      "c.name",
      "c.short_name",
      "c.category",
      "c.logo_url",
      "c.status",
      "c.created_at",
      db.raw(
        "(SELECT COUNT(*) FROM club_memberships cm WHERE cm.club_id = c.id AND cm.status = 'active') AS member_count",
      ),
      db.raw(
        "(SELECT COUNT(*) FROM events e WHERE e.club_id = c.id) AS event_count",
      ),
      db.raw(
        "(SELECT CONCAT(u.first_name, ' ', u.last_name) FROM club_memberships pm JOIN users u ON u.id = pm.user_id WHERE pm.club_id = c.id AND pm.status = 'active' AND pm.role = 'president' ORDER BY pm.join_date ASC LIMIT 1) AS president_name",
      ),
    )
    .offset(offset)
    .limit(limit);

  if (sortBy === "name") {
    clubsQuery = clubsQuery.orderBy("c.name", "asc");
  } else if (sortBy === "members") {
    clubsQuery = clubsQuery.orderByRaw(
      "member_count DESC NULLS LAST, c.name ASC",
    );
  } else {
    clubsQuery = clubsQuery.orderBy("c.created_at", "desc");
  }

  const clubs = await clubsQuery;

  return res.status(200).json({
    success: true,
    data: {
      items: clubs,
      page,
      limit,
      total,
    },
  });
};

exports.getClubDetails = async function getClubDetails(req, res) {
  const { clubId } = adminClubParamsSchema.parse(req.params);
  const club = await fetchClubOrThrow(req.universityId, clubId);

  const [registrationRequest, officers, recentActivity] = await Promise.all([
    db("club_registration_requests").where({ club_id: clubId }).first(),
    db("club_memberships as cm")
      .join("users as u", "u.id", "cm.user_id")
      .select(
        "u.id as user_id",
        "u.first_name",
        "u.last_name",
        "cm.role",
        "cm.status",
        "cm.join_date",
      )
      .where({ "cm.club_id": clubId, "cm.status": "active" })
      .whereNotIn("cm.role", ["member", "alumni"])
      .orderBy("cm.join_date", "asc"),
    db("audit_logs")
      .select(
        "id",
        "actor_id",
        "target_type",
        "target_id",
        "action",
        "old_value",
        "new_value",
        "ip_address",
        "timestamp",
      )
      .where({
        university_id: req.universityId,
        target_type: "club",
        target_id: clubId,
      })
      .orderBy("timestamp", "desc")
      .limit(5),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      club,
      registration_request: registrationRequest,
      officers,
      recent_activity: recentActivity,
    },
  });
};

exports.updateClubStatus = async function updateClubStatus(req, res) {
  const { clubId } = adminClubParamsSchema.parse(req.params);
  const { status } = adminClubStatusSchema.parse(req.body);

  if (status === "pending") {
    throw createHttpError(
      400,
      "INVALID_STATUS",
      "Club status cannot be changed to pending.",
    );
  }

  const club = await fetchClubOrThrow(req.universityId, clubId);

  if (club.status === status) {
    return res.status(200).json({
      success: true,
      data: { club },
    });
  }

  const updatedClub = await db.transaction(async (trx) => {
    const oldValue = { status: club.status };

    await trx("clubs")
      .where({ id: clubId })
      .update({ status, updated_at: trx.fn.now() });

    await logAudit(
      {
        universityId: req.universityId,
        actorId: req.userId,
        targetType: "club",
        targetId: clubId,
        action: "update_status",
        oldValue,
        newValue: { status },
        ipAddress: req.ip,
      },
      trx,
    );

    if (status === "suspended") {
      const president = await trx("club_memberships as cm")
        .join("users as u", "u.id", "cm.user_id")
        .select("u.id as user_id", "u.email", "u.first_name", "u.last_name")
        .where({
          "cm.club_id": clubId,
          "cm.status": "active",
          "cm.role": "president",
        })
        .first();

      if (president) {
        console.info(
          `Notification stub: club president ${president.email} should be notified that ${club.name} was suspended.`,
        );
      }
    }

    return trx("clubs").where({ id: clubId }).first();
  });

  return res.status(200).json({
    success: true,
    data: {
      club: updatedClub,
    },
  });
};

exports.deleteClub = async function deleteClub(req, res) {
  const { clubId } = adminClubParamsSchema.parse(req.params);
  const club = await fetchClubOrThrow(req.universityId, clubId);

  const updatedClub = await db.transaction(async (trx) => {
    await trx("clubs")
      .where({ id: clubId })
      .update({ status: "inactive", updated_at: trx.fn.now() });

    await logAudit(
      {
        universityId: req.universityId,
        actorId: req.userId,
        targetType: "club",
        targetId: clubId,
        action: "archive",
        oldValue: { status: club.status },
        newValue: { status: "inactive" },
        ipAddress: req.ip,
      },
      trx,
    );

    return trx("clubs").where({ id: clubId }).first();
  });

  return res.status(200).json({
    success: true,
    data: {
      club: updatedClub,
    },
  });
};

exports.listRegistrations = async function listRegistrations(req, res) {
  const parsed = adminClubRegistrationQuerySchema.parse(req.query);
  const { page, limit, status } = parsed;
  const offset = (page - 1) * limit;

  const baseQuery = db("club_registration_requests as r")
    .join("clubs as c", "c.id", "r.club_id")
    .leftJoin("users as u", "u.id", "r.requested_by_user_id")
    .where({ "c.university_id": req.universityId, "r.status": status });

  const totalRow = await baseQuery
    .clone()
    .countDistinct({ total: "r.id" })
    .first();
  const total = parseCount(totalRow?.total);

  const items = await baseQuery
    .clone()
    .select(
      "r.id",
      "r.club_id",
      "r.requested_by_user_id",
      "r.submitted_at",
      "r.status",
      "r.admin_user_id",
      "r.admin_notes",
      "r.resolved_at",
      "c.name as club_name",
      "c.short_name as club_short_name",
      "c.category",
      "c.status as club_status",
      "u.first_name",
      "u.last_name",
      "u.email",
    )
    .orderBy("r.submitted_at", "desc")
    .offset(offset)
    .limit(limit);

  return res.status(200).json({
    success: true,
    data: {
      items,
      page,
      limit,
      total,
    },
  });
};

exports.resolveRegistrationDecision =
  async function resolveRegistrationDecision(req, res) {
    const { clubId } = adminClubParamsSchema.parse(req.params);
    const { action, notes } = adminClubRegistrationDecisionSchema.parse(
      req.body,
    );

    const club = await fetchClubOrThrow(req.universityId, clubId);

    const result = await db.transaction(async (trx) => {
      const registration = await trx("club_registration_requests")
        .where({ club_id: clubId })
        .first();

      if (!registration) {
        throw createHttpError(
          404,
          "REGISTRATION_REQUEST_NOT_FOUND",
          "Registration request not found.",
        );
      }

      const nextRequestStatus =
        action === "approve"
          ? "approved"
          : action === "reject"
            ? "rejected"
            : "conditional";
      const nextClubStatus =
        action === "approve"
          ? "active"
          : action === "reject"
            ? "inactive"
            : "pending";

      await trx("club_registration_requests")
        .where({ club_id: clubId })
        .update({
          status: nextRequestStatus,
          admin_user_id: req.userId,
          admin_notes: notes || null,
          resolved_at: trx.fn.now(),
        });

      await trx("clubs").where({ id: clubId }).update({
        status: nextClubStatus,
        updated_at: trx.fn.now(),
      });

      if (action === "approve" && registration.requested_by_user_id) {
        await trx("club_memberships")
          .insert({
            user_id: registration.requested_by_user_id,
            club_id: clubId,
            role: "president",
            status: "active",
            join_date: trx.fn.now(),
            invited_by: req.userId,
          })
          .onConflict(["user_id", "club_id"])
          .merge({
            role: "president",
            status: "active",
            left_date: null,
            invited_by: req.userId,
            join_date: trx.fn.now(),
          });
      }

      await logAudit(
        {
          universityId: req.universityId,
          actorId: req.userId,
          targetType: "club",
          targetId: clubId,
          action: `registration_${action}`,
          oldValue: {
            club_status: club.status,
            request_status: registration.status,
          },
          newValue: {
            club_status: nextClubStatus,
            request_status: nextRequestStatus,
            notes: notes || null,
          },
          ipAddress: req.ip,
        },
        trx,
      );

      return {
        club: await trx("clubs").where({ id: clubId }).first(),
        registration_request: await trx("club_registration_requests")
          .where({ club_id: clubId })
          .first(),
      };
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  };

exports.listUsers = async function listUsers(req, res) {
  const parsed = adminUserListQuerySchema.parse(req.query);
  const { page, limit, role, search, is_active } = parsed;
  const offset = (page - 1) * limit;

  let baseQuery = db("users as u").where("u.university_id", req.universityId);

  if (role) {
    baseQuery = baseQuery.andWhere("u.user_type", role);
  }

  if (typeof is_active === "boolean") {
    baseQuery = baseQuery.andWhere("u.is_active", is_active);
  }

  if (search) {
    const searchTerm = `%${search}%`;
    baseQuery = baseQuery.andWhereRaw(
      "(u.first_name ILIKE ? OR u.last_name ILIKE ? OR u.email ILIKE ?)",
      [searchTerm, searchTerm, searchTerm],
    );
  }

  const totalRow = await baseQuery
    .clone()
    .countDistinct({ total: "u.id" })
    .first();
  const total = parseCount(totalRow?.total);

  const items = await baseQuery
    .clone()
    .select(
      "u.id",
      "u.first_name",
      "u.last_name",
      "u.email",
      "u.user_type",
      "u.enrollment_status",
      "u.is_active",
      "u.created_at",
    )
    .orderBy("u.created_at", "desc")
    .offset(offset)
    .limit(limit);

  return res.status(200).json({
    success: true,
    data: {
      items,
      page,
      limit,
      total,
    },
  });
};

exports.getUserDetails = async function getUserDetails(req, res) {
  const { userId } = adminUserParamsSchema.parse(req.params);
  const user = await db("users")
    .select(
      "id",
      "university_id",
      "email",
      "first_name",
      "last_name",
      "student_id",
      "user_type",
      "major",
      "department",
      "enrollment_status",
      "profile_image_url",
      "bio",
      "interests",
      "privacy_profile_visible",
      "privacy_roster_visible",
      "allow_ai_recommend",
      "notification_preferences",
      "is_active",
      "created_at",
      "last_login",
    )
    .where({ id: userId, university_id: req.universityId })
    .first();

  if (!user) {
    throw createHttpError(404, "USER_NOT_FOUND", "User not found.");
  }

  const memberships = await db("club_memberships as cm")
    .join("clubs as c", "c.id", "cm.club_id")
    .select(
      "cm.id",
      "cm.role",
      "cm.status",
      "cm.join_date",
      "cm.left_date",
      "c.id as club_id",
      "c.name as club_name",
      "c.short_name as club_short_name",
      "c.status as club_status",
    )
    .where({ "cm.user_id": userId, "c.university_id": req.universityId })
    .orderBy("cm.join_date", "desc");

  return res.status(200).json({
    success: true,
    data: {
      user,
      memberships,
    },
  });
};

exports.updateUserStatus = async function updateUserStatus(req, res) {
  const { userId } = adminUserParamsSchema.parse(req.params);
  const { is_active } = adminUserStatusSchema.parse(req.body);

  const user = await db("users")
    .where({ id: userId, university_id: req.universityId })
    .first();

  if (!user) {
    throw createHttpError(404, "USER_NOT_FOUND", "User not found.");
  }

  const updatedUser = await db.transaction(async (trx) => {
    await trx("users")
      .where({ id: userId })
      .update({ is_active, last_login: user.last_login });

    await logAudit(
      {
        universityId: req.universityId,
        actorId: req.userId,
        targetType: "user",
        targetId: userId,
        action: is_active ? "activate_user" : "deactivate_user",
        oldValue: { is_active: user.is_active },
        newValue: { is_active },
        ipAddress: req.ip,
      },
      trx,
    );

    return trx("users")
      .select(
        "id",
        "email",
        "first_name",
        "last_name",
        "user_type",
        "enrollment_status",
        "is_active",
      )
      .where({ id: userId })
      .first();
  });

  return res.status(200).json({
    success: true,
    data: {
      user: updatedUser,
    },
  });
};

exports.getClubHealthReport = async function getClubHealthReport(req, res) {
  const [statusCounts, activeMembers] = await Promise.all([
    db("clubs")
      .where({ university_id: req.universityId })
      .select("status")
      .count("* as count")
      .groupBy("status"),
    db("club_memberships as cm")
      .join("clubs as c", "c.id", "cm.club_id")
      .where({ "c.university_id": req.universityId, "cm.status": "active" })
      .count("* as count")
      .first(),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      clubs_by_status: statusCounts.map((s) => ({
        status: s.status,
        count: parseCount(s.count),
      })),
      total_active_memberships: parseCount(activeMembers?.count),
      generated_at: new Date().toISOString(),
    },
  });
};

exports.getEngagementReport = async function getEngagementReport(req, res) {
  const { start, end } = getMonthWindow();

  const [activeUsersRow, totalEventsRow, totalRsvpsRow] = await Promise.all([
    db("users")
      .where({ university_id: req.universityId })
      .andWhere("last_login", ">=", start)
      .count("* as count")
      .first(),
    db("events as e")
      .join("clubs as c", "c.id", "e.club_id")
      .where("c.university_id", req.universityId)
      .andWhere("e.start_datetime", ">=", start)
      .andWhere("e.start_datetime", "<", end)
      .count("* as count")
      .first(),
    db("event_rsvps as r")
      .join("events as e", "e.id", "r.event_id")
      .join("clubs as c", "c.id", "e.club_id")
      .where("c.university_id", req.universityId)
      .andWhere("e.start_datetime", ">=", start)
      .andWhere("e.start_datetime", "<", end)
      .count("* as count")
      .first(),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      generated_at: new Date().toISOString(),
      summary: {
        monthly_active_users: parseCount(activeUsersRow?.count),
        events_this_month: parseCount(totalEventsRow?.count),
        total_rsvps: parseCount(totalRsvpsRow?.count),
        note: "University-wide engagement overview for the current month.",
      },
    },
  });
};

exports.awardAchievement = async function awardAchievement(req, res) {
  const { user_id, club_id, achievement_code } = req.body;

  const achievement = await db("achievements")
    .where({ code: achievement_code })
    .first();
  if (!achievement) {
    throw createHttpError(
      404,
      "ACHIEVEMENT_NOT_FOUND",
      "Achievement code not found.",
    );
  }

  if (user_id) {
    await db("user_achievements")
      .insert({
        user_id,
        achievement_id: achievement.id,
        awarded_at: db.fn.now(),
      })
      .onConflict(["user_id", "achievement_id"])
      .ignore();
  } else if (club_id) {
    await db("club_achievements")
      .insert({
        club_id,
        achievement_id: achievement.id,
        awarded_at: db.fn.now(),
      })
      .onConflict(["club_id", "achievement_id"])
      .ignore();
  } else {
    throw createHttpError(
      400,
      "MISSING_TARGET",
      "user_id or club_id is required.",
    );
  }

  return res
    .status(201)
    .json({
      success: true,
      data: { message: "Achievement awarded successfully." },
    });
};
