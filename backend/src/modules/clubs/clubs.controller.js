const db = require("../../db/connection");
const { logAudit } = require("../../utils/auditLogger");
const { evaluateAll } = require("../../utils/achievementEngine");
const {
  publicClubListQuerySchema,
  clubIdParamsSchema,
  clubProfileUpdateSchema,
  clubMediaCreateSchema,
  membershipRequestsQuerySchema,
  membershipRequestDecisionSchema,
  inviteMemberSchema,
  clubMembersQuerySchema,
  roleDefinitionCreateSchema,
  roleDefinitionUpdateSchema,
  clubRegistrationSchema,
} = require("./clubs.validation");

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

function applyClubSearch(query, alias, search) {
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

function monthWindow(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

async function fetchClubOrThrow(
  universityId,
  clubId,
  { allowAnyStatus = false } = {},
) {
  const club = await db("clubs")
    .where({ id: clubId, university_id: universityId })
    .first();

  if (!club || (!allowAnyStatus && club.status !== "active")) {
    throw createHttpError(404, "CLUB_NOT_FOUND", "Club not found.");
  }

  return club;
}

async function canUsePermission(client, clubId, roleName, permissionName) {
  if (roleName === "president") {
    return true;
  }

  const roleDefinition = await client("club_role_definitions")
    .where({ club_id: clubId, role_name: roleName })
    .first();

  return Boolean(roleDefinition?.permissions?.[permissionName]);
}

async function loadClubRoleDefinition(client, clubId, roleName) {
  return client("club_role_definitions")
    .where({ club_id: clubId, role_name: roleName })
    .first();
}

function mapClubWithCounts(club) {
  return {
    ...club,
    member_count: parseCount(club.member_count),
    event_count: parseCount(club.event_count),
  };
}

function buildUpcomingEventMap(events) {
  const grouped = new Map();

  for (const event of events) {
    if (!grouped.has(event.club_id)) {
      grouped.set(event.club_id, {
        id: event.id,
        club_id: event.club_id,
        title: event.title,
        start_datetime: event.start_datetime,
        location: event.location,
        status: event.status,
        visibility: event.visibility,
      });
    }
  }

  return grouped;
}

exports.listPublicClubs = async function listPublicClubs(req, res) {
  const parsed = publicClubListQuerySchema.parse(req.query);
  const { page, limit, category, search, sortBy } = parsed;
  const offset = (page - 1) * limit;

  let baseQuery = db("clubs as c").where({
    "c.university_id": req.universityId,
    "c.status": "active",
  });

  if (category) {
    baseQuery = baseQuery.andWhereRaw("LOWER(c.category) = ?", [
      category.toLowerCase(),
    ]);
  }

  baseQuery = applyClubSearch(baseQuery, "c", search);

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
      "c.cover_photo_url",
      "c.mission_statement",
      "c.tags",
      "c.recruiting_status",
      "c.created_at",
      db.raw(
        "(SELECT COUNT(*) FROM club_memberships cm WHERE cm.club_id = c.id AND cm.status = 'active') AS member_count",
      ),
      db.raw(
        "(SELECT CONCAT(u.first_name, ' ', u.last_name) FROM club_memberships pm JOIN users u ON u.id = pm.user_id WHERE pm.club_id = c.id AND pm.role = 'president' AND pm.status = 'active' ORDER BY pm.join_date ASC LIMIT 1) AS president_name",
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

  const clubs = (await clubsQuery).map(mapClubWithCounts);
  const clubIds = clubs.map((club) => club.id);
  const upcomingEvents = clubIds.length
    ? await db("events")
        .select(
          "id",
          "club_id",
          "title",
          "start_datetime",
          "location",
          "status",
          "visibility",
        )
        .whereIn("club_id", clubIds)
        .andWhere("status", "published")
        .andWhere("start_datetime", ">=", new Date())
        .orderBy("club_id", "asc")
        .orderBy("start_datetime", "asc")
    : [];

  const upcomingEventMap = buildUpcomingEventMap(upcomingEvents);

  return res.status(200).json({
    success: true,
    data: {
      items: clubs.map((club) => ({
        ...club,
        next_upcoming_event: upcomingEventMap.get(club.id) || null,
      })),
      page,
      limit,
      total,
    },
  });
};

exports.getPublicClubProfile = async function getPublicClubProfile(req, res) {
  const { clubId } = clubIdParamsSchema.parse(req.params);
  const club = await fetchClubOrThrow(req.universityId, clubId);

  const [memberCountRow, upcomingEvents, publicProjects, mediaGallery] =
    await Promise.all([
      db("club_memberships")
        .where({ club_id: clubId, status: "active" })
        .count("* as count")
        .first(),
      db("events")
        .select(
          "id",
          "title",
          "description",
          "start_datetime",
          "end_datetime",
          "location",
          "virtual_meeting_link",
          "cover_image_url",
          "status",
          "visibility",
        )
        .where({ club_id: clubId, status: "published" })
        .andWhere("start_datetime", ">=", new Date())
        .orderBy("start_datetime", "asc")
        .limit(3),
      db("projects")
        .select(
          "id",
          "title",
          "description",
          "start_date",
          "end_date",
          "status",
          "visibility",
          "cover_image_url",
          "created_at",
        )
        .where({ club_id: clubId, visibility: "public" })
        .orderBy("created_at", "desc")
        .limit(3),
      db("club_media_gallery")
        .select("id", "media_url", "media_type", "caption", "sort_order")
        .where({ club_id: clubId })
        .orderBy("sort_order", "asc")
        .orderBy("id", "asc")
        .limit(12),
    ]);

  return res.status(200).json({
    success: true,
    data: {
      club: {
        ...club,
        member_count: parseCount(memberCountRow?.count),
        upcoming_events: upcomingEvents,
        public_projects: publicProjects,
        media_gallery: mediaGallery,
      },
    },
  });
};

exports.updateClubProfile = async function updateClubProfile(req, res) {
  const { clubId } = clubIdParamsSchema.parse(req.params);
  const payload = clubProfileUpdateSchema.parse(req.body);

  if (!["president", "vice_president"].includes(req.membership.role)) {
    throw createHttpError(
      403,
      "FORBIDDEN",
      "Only the president or vice president can update this club profile.",
    );
  }

  const club = await fetchClubOrThrow(req.universityId, clubId, {
    allowAnyStatus: true,
  });

  const updatedClub = await db.transaction(async (trx) => {
    if (payload.name) {
      const duplicateName = await trx("clubs")
        .whereRaw("LOWER(name) = ?", [payload.name.toLowerCase()])
        .andWhere("university_id", req.universityId)
        .andWhereNot("id", clubId)
        .first();

      if (duplicateName) {
        throw createHttpError(
          409,
          "CLUB_NAME_TAKEN",
          "A club with this name already exists in the university.",
        );
      }
    }

    if (payload.short_name !== undefined && payload.short_name !== null) {
      const duplicateShortName = await trx("clubs")
        .whereRaw("LOWER(short_name) = ?", [payload.short_name.toLowerCase()])
        .andWhere("university_id", req.universityId)
        .andWhereNot("id", clubId)
        .first();

      if (duplicateShortName) {
        throw createHttpError(
          409,
          "CLUB_SHORT_NAME_TAKEN",
          "A club with this short name already exists in the university.",
        );
      }
    }

    const updatePayload = {
      updated_at: trx.fn.now(),
    };

    for (const key of [
      "name",
      "short_name",
      "category",
      "secondary_categories",
      "mission_statement",
      "logo_url",
      "cover_photo_url",
      "contact_email",
      "social_links",
      "tags",
      "meeting_schedule",
      "recruiting_status",
      "faculty_advisor_name",
      "faculty_advisor_email",
      "constitution_url",
    ]) {
      if (payload[key] !== undefined) {
        updatePayload[key] = payload[key];
      }
    }

    await trx("clubs").where({ id: clubId }).update(updatePayload);

    await logAudit(
      {
        universityId: req.universityId,
        actorId: req.userId,
        targetType: "club",
        targetId: clubId,
        action: "update_profile",
        oldValue: club,
        newValue: { ...club, ...updatePayload },
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

exports.getClubManageView = async function getClubManageView(req, res) {
  const { clubId } = clubIdParamsSchema.parse(req.params);
  const club = await fetchClubOrThrow(req.universityId, clubId, {
    allowAnyStatus: true,
  });

  if (["member", "alumni"].includes(req.membership.role)) {
    throw createHttpError(403, "FORBIDDEN", "Officer access is required.");
  }

  const [{ count: totalMembers }, { count: newMembersThisMonth }] =
    await Promise.all([
      db("club_memberships")
        .where({ club_id: clubId, status: "active" })
        .count("* as count")
        .first(),
      db("club_memberships")
        .where({ club_id: clubId, status: "active" })
        .andWhere("join_date", ">=", monthWindow().start)
        .count("* as count")
        .first(),
    ]);

  return res.status(200).json({
    success: true,
    data: {
      club,
      membership_stats: {
        total_members: parseCount(totalMembers),
        new_members_this_month: parseCount(newMembersThisMonth),
      },
    },
  });
};

exports.listClubMedia = async function listClubMedia(req, res) {
  const { clubId } = clubIdParamsSchema.parse(req.params);
  await fetchClubOrThrow(req.universityId, clubId, { allowAnyStatus: true });

  const mediaGallery = await db("club_media_gallery")
    .select("id", "media_url", "media_type", "caption", "sort_order")
    .where({ club_id: clubId })
    .orderBy("sort_order", "asc")
    .orderBy("id", "asc");

  return res.status(200).json({
    success: true,
    data: {
      items: mediaGallery,
    },
  });
};

exports.createClubMedia = async function createClubMedia(req, res) {
  const { clubId } = clubIdParamsSchema.parse(req.params);
  const payload = clubMediaCreateSchema.parse(req.body);
  await fetchClubOrThrow(req.universityId, clubId, { allowAnyStatus: true });

  const created = await db("club_media_gallery")
    .insert({
      club_id: clubId,
      media_url: payload.media_url,
      media_type: payload.media_type,
      caption: payload.caption || null,
      sort_order: payload.sort_order,
    })
    .returning([
      "id",
      "club_id",
      "media_url",
      "media_type",
      "caption",
      "sort_order",
    ]);

  return res.status(201).json({
    success: true,
    data: {
      media: created[0],
    },
  });
};

exports.deleteClubMedia = async function deleteClubMedia(req, res) {
  const { clubId } = clubIdParamsSchema.parse(req.params);
  const { mediaId } = req.params;
  await fetchClubOrThrow(req.universityId, clubId, { allowAnyStatus: true });

  const deleted = await db("club_media_gallery")
    .where({ id: mediaId, club_id: clubId })
    .del();

  if (!deleted) {
    throw createHttpError(404, "MEDIA_NOT_FOUND", "Media item not found.");
  }

  return res.status(200).json({
    success: true,
    data: {
      message: "Media item removed successfully.",
    },
  });
};

exports.joinClub = async function joinClub(req, res) {
  const { clubId } = clubIdParamsSchema.parse(req.params);
  const club = await fetchClubOrThrow(req.universityId, clubId);

  const existingMembership = await db("club_memberships")
    .where({ club_id: clubId, user_id: req.userId })
    .first();

  const existingRequest = await db("membership_requests")
    .where({ club_id: clubId, user_id: req.userId })
    .first();

  if (existingMembership && existingMembership.status === "active") {
    throw createHttpError(
      409,
      "ALREADY_MEMBER",
      "You are already a member of this club.",
    );
  }

  if (existingRequest && existingRequest.status === "pending") {
    throw createHttpError(
      409,
      "REQUEST_ALREADY_PENDING",
      "A membership request is already pending.",
    );
  }

  if (club.membership_policy === "invite_only") {
    throw createHttpError(
      403,
      "INVITE_ONLY",
      "This club only accepts invitations.",
    );
  }

  const result = await db.transaction(async (trx) => {
    if (club.membership_policy === "open") {
      await trx("club_memberships")
        .insert({
          user_id: req.userId,
          club_id: clubId,
          role: "member",
          status: "active",
          join_date: trx.fn.now(),
        })
        .onConflict(["user_id", "club_id"])
        .merge({
          role: "member",
          status: "active",
          left_date: null,
          join_date: trx.fn.now(),
        });

      await logAudit(
        {
          universityId: req.universityId,
          actorId: req.userId,
          targetType: "club",
          targetId: clubId,
          action: "join_club",
          oldValue: null,
          newValue: { role: "member", status: "active" },
          ipAddress: req.ip,
        },
        trx,
      );

      return { joined: true, status: "active" };
    }

    const inserted = await trx("membership_requests")
      .insert({
        user_id: req.userId,
        club_id: clubId,
        status: "pending",
        requested_at: trx.fn.now(),
      })
      .returning(["id", "status", "requested_at"]);

    return {
      joined: false,
      status: inserted[0]?.status || "pending",
      request: inserted[0],
    };
  });

  if (result.joined) {
    try {
      await evaluateAll(req.userId);
    } catch (err) {
      // Keep join success even if achievement checks fail.
    }
  }

  return res.status(201).json({
    success: true,
    data: result,
  });
};

exports.listMembershipRequests = async function listMembershipRequests(
  req,
  res,
) {
  const { clubId } = clubIdParamsSchema.parse(req.params);
  const parsed = membershipRequestsQuerySchema.parse(req.query);
  const { page, limit, status } = parsed;
  const offset = (page - 1) * limit;
  await fetchClubOrThrow(req.universityId, clubId, { allowAnyStatus: true });

  const baseQuery = db("membership_requests as mr")
    .join("users as u", "u.id", "mr.user_id")
    .where({ "mr.club_id": clubId, "mr.status": status });

  const totalRow = await baseQuery
    .clone()
    .countDistinct({ total: "mr.id" })
    .first();
  const total = parseCount(totalRow?.total);

  const items = await baseQuery
    .clone()
    .select(
      "mr.id",
      "mr.user_id",
      "mr.club_id",
      "mr.status",
      "mr.requested_at",
      "mr.action_by",
      "mr.denial_reason",
      "u.first_name",
      "u.last_name",
      "u.email",
    )
    .orderBy("mr.requested_at", "desc")
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

exports.respondMembershipRequest = async function respondMembershipRequest(
  req,
  res,
) {
  const { clubId } = clubIdParamsSchema.parse(req.params);
  const { requestId } = req.params;
  const { action, denial_reason } = membershipRequestDecisionSchema.parse(
    req.body,
  );
  await fetchClubOrThrow(req.universityId, clubId, { allowAnyStatus: true });

  const result = await db.transaction(async (trx) => {
    const request = await trx("membership_requests")
      .where({ id: requestId, club_id: clubId })
      .first();

    if (!request) {
      throw createHttpError(
        404,
        "REQUEST_NOT_FOUND",
        "Membership request not found.",
      );
    }

    if (request.status !== "pending") {
      throw createHttpError(
        409,
        "REQUEST_ALREADY_RESOLVED",
        "This request has already been resolved.",
      );
    }

    if (action === "approve") {
      await trx("membership_requests")
        .where({ id: requestId })
        .update({
          status: "approved",
          action_by: req.userId,
          denial_reason: null,
        });

      await trx("club_memberships")
        .insert({
          user_id: request.user_id,
          club_id: clubId,
          role: "member",
          status: "active",
          join_date: trx.fn.now(),
          invited_by: req.userId,
        })
        .onConflict(["user_id", "club_id"])
        .merge({
          role: "member",
          status: "active",
          left_date: null,
          join_date: trx.fn.now(),
          invited_by: req.userId,
        });
    } else {
      await trx("membership_requests")
        .where({ id: requestId })
        .update({
          status: "denied",
          action_by: req.userId,
          denial_reason: denial_reason || null,
        });
    }

    await logAudit(
      {
        universityId: req.universityId,
        actorId: req.userId,
        targetType: "club",
        targetId: clubId,
        action: `membership_request_${action}`,
        oldValue: { status: request.status },
        newValue: {
          status: action === "approve" ? "approved" : "denied",
          denial_reason: denial_reason || null,
        },
        ipAddress: req.ip,
      },
      trx,
    );

    return trx("membership_requests").where({ id: requestId }).first();
  });

  return res.status(200).json({
    success: true,
    data: {
      request: result,
    },
  });
};

exports.inviteMember = async function inviteMember(req, res) {
  const { clubId } = clubIdParamsSchema.parse(req.params);
  const payload = inviteMemberSchema.parse(req.body);
  await fetchClubOrThrow(req.universityId, clubId, { allowAnyStatus: true });

  const user = await db("users")
    .where({ university_id: req.universityId, email: payload.user_email })
    .first();

  if (!user) {
    throw createHttpError(
      404,
      "USER_NOT_FOUND",
      "The invited user was not found in this university.",
    );
  }

  const membership = await db.transaction(async (trx) => {
    await trx("club_memberships")
      .insert({
        user_id: user.id,
        club_id: clubId,
        role: "member",
        status: "active",
        join_date: trx.fn.now(),
        invited_by: req.userId,
      })
      .onConflict(["user_id", "club_id"])
      .merge({
        role: "member",
        status: "active",
        left_date: null,
        join_date: trx.fn.now(),
        invited_by: req.userId,
      });

    await logAudit(
      {
        universityId: req.universityId,
        actorId: req.userId,
        targetType: "club",
        targetId: clubId,
        action: "invite_member",
        oldValue: null,
        newValue: { user_id: user.id, email: user.email },
        ipAddress: req.ip,
      },
      trx,
    );

    return trx("club_memberships")
      .where({ club_id: clubId, user_id: user.id })
      .first();
  });

  return res.status(201).json({
    success: true,
    data: {
      membership,
    },
  });
};

exports.listMembers = async function listMembers(req, res) {
  const { clubId } = clubIdParamsSchema.parse(req.params);
  const parsed = clubMembersQuerySchema.parse(req.query);
  const { page, limit, role, status, search } = parsed;
  const offset = (page - 1) * limit;
  await fetchClubOrThrow(req.universityId, clubId, { allowAnyStatus: true });

  let baseQuery = db("club_memberships as cm")
    .join("users as u", "u.id", "cm.user_id")
    .where({ "cm.club_id": clubId });

  if (role) {
    baseQuery = baseQuery.andWhere("cm.role", role);
  }

  if (status) {
    baseQuery = baseQuery.andWhere("cm.status", status);
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
    .countDistinct({ total: "cm.id" })
    .first();
  const total = parseCount(totalRow?.total);

  const items = await baseQuery
    .clone()
    .select(
      "cm.id",
      "cm.user_id",
      "cm.club_id",
      "cm.role",
      "cm.status",
      "cm.join_date",
      "cm.left_date",
      "u.first_name",
      "u.last_name",
      "u.email",
    )
    .orderBy("cm.join_date", "desc")
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

exports.updateMemberRole = async function updateMemberRole(req, res) {
  const { clubId } = clubIdParamsSchema.parse(req.params);
  const { userId } = req.params;
  const role = typeof req.body.role === "string" ? req.body.role.trim() : "";

  if (!role) {
    throw createHttpError(400, "VALIDATION_ERROR", "role is required.");
  }

  await fetchClubOrThrow(req.universityId, clubId, { allowAnyStatus: true });

  const allowed = await canUsePermission(
    db,
    clubId,
    req.membership.role,
    "manage_roles",
  );
  if (!allowed) {
    throw createHttpError(
      403,
      "FORBIDDEN",
      "You do not have permission to change member roles.",
    );
  }

  const membership = await db("club_memberships")
    .where({ club_id: clubId, user_id: userId })
    .first();

  if (!membership) {
    throw createHttpError(404, "MEMBERSHIP_NOT_FOUND", "Member not found.");
  }

  const updated = await db.transaction(async (trx) => {
    await trx("club_memberships")
      .where({ club_id: clubId, user_id: userId })
      .update({
        role,
        status: membership.status,
        left_date: membership.left_date,
      });

    await logAudit(
      {
        universityId: req.universityId,
        actorId: req.userId,
        targetType: "club",
        targetId: clubId,
        action: "update_member_role",
        oldValue: { role: membership.role },
        newValue: { role },
        ipAddress: req.ip,
      },
      trx,
    );

    return trx("club_memberships")
      .where({ club_id: clubId, user_id: userId })
      .first();
  });

  return res.status(200).json({
    success: true,
    data: {
      membership: updated,
    },
  });
};

exports.removeMember = async function removeMember(req, res) {
  const { clubId } = clubIdParamsSchema.parse(req.params);
  const { userId } = req.params;
  await fetchClubOrThrow(req.universityId, clubId, { allowAnyStatus: true });

  const membership = await db("club_memberships")
    .where({ club_id: clubId, user_id: userId })
    .first();

  if (!membership) {
    throw createHttpError(404, "MEMBERSHIP_NOT_FOUND", "Member not found.");
  }

  const updated = await db.transaction(async (trx) => {
    await trx("club_memberships")
      .where({ club_id: clubId, user_id: userId })
      .update({
        status: "suspended",
        left_date: trx.fn.now(),
      });

    await logAudit(
      {
        universityId: req.universityId,
        actorId: req.userId,
        targetType: "club",
        targetId: clubId,
        action: "remove_member",
        oldValue: { status: membership.status },
        newValue: { status: "suspended" },
        ipAddress: req.ip,
      },
      trx,
    );

    return trx("club_memberships")
      .where({ club_id: clubId, user_id: userId })
      .first();
  });

  return res.status(200).json({
    success: true,
    data: {
      membership: updated,
    },
  });
};

exports.listRoles = async function listRoles(req, res) {
  const { clubId } = clubIdParamsSchema.parse(req.params);
  await fetchClubOrThrow(req.universityId, clubId, { allowAnyStatus: true });

  const roles = await db("club_role_definitions")
    .select("id", "club_id", "role_name", "is_custom", "permissions")
    .where({ club_id: clubId })
    .orderBy("is_custom", "asc")
    .orderBy("role_name", "asc");

  return res.status(200).json({
    success: true,
    data: {
      items: roles,
    },
  });
};

exports.createRole = async function createRole(req, res) {
  const { clubId } = clubIdParamsSchema.parse(req.params);
  const payload = roleDefinitionCreateSchema.parse(req.body);
  await fetchClubOrThrow(req.universityId, clubId, { allowAnyStatus: true });

  const allowed = await canUsePermission(
    db,
    clubId,
    req.membership.role,
    "manage_roles",
  );
  if (!allowed) {
    throw createHttpError(
      403,
      "FORBIDDEN",
      "You do not have permission to create custom roles.",
    );
  }

  const existing = await db("club_role_definitions")
    .where({ club_id: clubId, role_name: payload.role_name })
    .first();

  if (existing) {
    throw createHttpError(
      409,
      "ROLE_ALREADY_EXISTS",
      "A role with this name already exists.",
    );
  }

  const created = await db("club_role_definitions")
    .insert({
      club_id: clubId,
      role_name: payload.role_name,
      is_custom: true,
      permissions: payload.permissions,
    })
    .returning(["id", "club_id", "role_name", "is_custom", "permissions"]);

  return res.status(201).json({
    success: true,
    data: {
      role: created[0],
    },
  });
};

exports.updateRole = async function updateRole(req, res) {
  const { clubId } = clubIdParamsSchema.parse(req.params);
  const { roleId } = req.params;
  const payload = roleDefinitionUpdateSchema.parse(req.body);
  await fetchClubOrThrow(req.universityId, clubId, { allowAnyStatus: true });

  const allowed = await canUsePermission(
    db,
    clubId,
    req.membership.role,
    "manage_roles",
  );
  if (!allowed) {
    throw createHttpError(
      403,
      "FORBIDDEN",
      "You do not have permission to update roles.",
    );
  }

  const role = await db("club_role_definitions")
    .where({ id: roleId, club_id: clubId })
    .first();

  if (!role) {
    throw createHttpError(404, "ROLE_NOT_FOUND", "Role not found.");
  }

  if (
    !role.is_custom &&
    payload.role_name &&
    payload.role_name !== role.role_name
  ) {
    throw createHttpError(403, "FORBIDDEN", "System roles cannot be renamed.");
  }

  if (payload.role_name && payload.role_name !== role.role_name) {
    const duplicate = await db("club_role_definitions")
      .where({ club_id: clubId, role_name: payload.role_name })
      .andWhereNot("id", roleId)
      .first();

    if (duplicate) {
      throw createHttpError(
        409,
        "ROLE_ALREADY_EXISTS",
        "A role with this name already exists.",
      );
    }
  }

  const updatePayload = {};
  if (payload.role_name !== undefined) {
    updatePayload.role_name = payload.role_name;
  }
  if (payload.permissions !== undefined) {
    updatePayload.permissions = payload.permissions;
  }

  const updated = await db("club_role_definitions")
    .where({ id: roleId, club_id: clubId })
    .update(updatePayload)
    .returning(["id", "club_id", "role_name", "is_custom", "permissions"]);

  return res.status(200).json({
    success: true,
    data: {
      role: updated[0],
    },
  });
};

exports.deleteRole = async function deleteRole(req, res) {
  const { clubId } = clubIdParamsSchema.parse(req.params);
  const { roleId } = req.params;
  await fetchClubOrThrow(req.universityId, clubId, { allowAnyStatus: true });

  const allowed = await canUsePermission(
    db,
    clubId,
    req.membership.role,
    "manage_roles",
  );
  if (!allowed) {
    throw createHttpError(
      403,
      "FORBIDDEN",
      "You do not have permission to delete roles.",
    );
  }

  const role = await db("club_role_definitions")
    .where({ id: roleId, club_id: clubId })
    .first();

  if (!role) {
    throw createHttpError(404, "ROLE_NOT_FOUND", "Role not found.");
  }

  if (!role.is_custom) {
    throw createHttpError(403, "FORBIDDEN", "System roles cannot be deleted.");
  }

  const assignedCount = await db("club_memberships")
    .where({ club_id: clubId, role: role.role_name, status: "active" })
    .count("* as count")
    .first();

  if (parseCount(assignedCount?.count) > 0) {
    throw createHttpError(
      409,
      "ROLE_IN_USE",
      "This role is currently assigned to members.",
    );
  }

  await db("club_role_definitions")
    .where({ id: roleId, club_id: clubId })
    .del();

  return res.status(200).json({
    success: true,
    data: {
      message: "Role deleted successfully.",
    },
  });
};

exports.registerClub = async function registerClub(req, res) {
  if (req.userRole !== "student") {
    throw createHttpError(
      403,
      "FORBIDDEN",
      "Only students can register a new club.",
    );
  }

  const payload = clubRegistrationSchema.parse(req.body);

  const result = await db.transaction(async (trx) => {
    const duplicateName = await trx("clubs")
      .whereRaw("LOWER(name) = ?", [payload.name.toLowerCase()])
      .andWhere("university_id", req.universityId)
      .first();

    if (duplicateName) {
      throw createHttpError(
        409,
        "CLUB_NAME_TAKEN",
        "A club with this name already exists in the university.",
      );
    }

    if (payload.short_name) {
      const duplicateShortName = await trx("clubs")
        .whereRaw("LOWER(short_name) = ?", [payload.short_name.toLowerCase()])
        .andWhere("university_id", req.universityId)
        .first();

      if (duplicateShortName) {
        throw createHttpError(
          409,
          "CLUB_SHORT_NAME_TAKEN",
          "A club with this short name already exists in the university.",
        );
      }
    }

    const clubRows = await trx("clubs")
      .insert({
        university_id: req.universityId,
        name: payload.name,
        short_name: payload.short_name || null,
        category: payload.category,
        secondary_categories: payload.secondary_categories || null,
        mission_statement: payload.mission_statement || null,
        logo_url: payload.logo_url || null,
        cover_photo_url: payload.cover_photo_url || null,
        contact_email: payload.contact_email,
        social_links: payload.social_links || null,
        membership_policy: payload.membership_policy || "approval",
        recruiting_status: payload.recruiting_status ?? true,
        status: "pending",
        constitution_url: payload.constitution_url || null,
        faculty_advisor_name: payload.faculty_advisor_name || null,
        faculty_advisor_email: payload.faculty_advisor_email || null,
        meeting_schedule: payload.meeting_schedule || null,
        tags: payload.tags || null,
      })
      .returning(["id", "name", "status", "created_at"]);

    const club = clubRows[0];

    await trx("club_registration_requests").insert({
      club_id: club.id,
      requested_by_user_id: req.userId,
      status: "pending",
      submitted_at: trx.fn.now(),
    });

    return club;
  });

  return res.status(201).json({
    success: true,
    data: {
      club: result,
    },
  });
};
