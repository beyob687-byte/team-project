const db = require("../../db/connection");
const { uploadImage, uploadVideo } = require("../../utils/cloudinaryUpload");
const {
  createProjectSchema,
  updateProjectSchema,
  mediaCreateSchema,
  projectsQuerySchema,
  paramsSchema,
} = require("./projects.validation");

function createHttpError(statusCode, code, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

function normalizeArray(value) {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      throw createHttpError(400, "VALIDATION", "Invalid JSON array payload");
    }
  }
  return [];
}

async function ensureClub(clubId, universityId) {
  const club = await db("clubs")
    .where({ id: clubId, university_id: universityId })
    .first();
  if (!club) throw createHttpError(404, "NOT_FOUND", "Club not found");
  return club;
}

async function getMembership(clubId, userId) {
  return db("club_memberships")
    .where({ club_id: clubId, user_id: userId, status: "active" })
    .first();
}

async function ensureProject(clubId, projectId, universityId) {
  const project = await db("projects as p")
    .join("clubs as c", "c.id", "p.club_id")
    .where({ "p.id": projectId, "p.club_id": clubId, "c.university_id": universityId })
    .select("p.*")
    .first();

  if (!project) throw createHttpError(404, "NOT_FOUND", "Project not found");
  return project;
}

function canEditProject(project, req) {
  return (
    String(project.created_by || "") === String(req.userId || "") ||
    req.membership?.role === "president" ||
    req.membership?.role === "vice_president"
  );
}

async function uploadByType(file, type) {
  if (type === "video") {
    return uploadVideo(file.buffer, { mimeType: file.mimetype });
  }
  if (type === "document") {
    return uploadImage(file.buffer, {
      mimeType: file.mimetype,
      resource_type: "raw",
    });
  }
  return uploadImage(file.buffer, { mimeType: file.mimetype });
}

exports.createProject = async function createProject(req, res, next) {
  try {
    const collaborators = normalizeArray(req.body.collaborators);
    const external_links = normalizeArray(req.body.external_links);

    const parsed = createProjectSchema.parse({
      ...req.body,
      collaborators,
      external_links,
    });

    await ensureClub(req.params.clubId, req.universityId);

    let cover_image_url = null;
    if (req.file?.buffer) {
      const uploaded = await uploadImage(req.file.buffer, {
        mimeType: req.file.mimetype,
      });
      cover_image_url = uploaded.url;
    }

    const created = await db.transaction(async (trx) => {
      const [project] = await trx("projects")
        .insert({
          club_id: req.params.clubId,
          title: parsed.title,
          description: parsed.description || null,
          start_date: parsed.start_date || null,
          end_date: parsed.end_date || null,
          status: parsed.status,
          visibility: parsed.visibility,
          cover_image_url,
          outcome: parsed.outcome || null,
          created_by: req.userId,
        })
        .returning("*");

      if (parsed.collaborators?.length) {
        await trx("project_collaborators").insert(
          parsed.collaborators.map((item) => ({
            project_id: project.id,
            user_id: item.user_id,
            role: item.role || null,
          })),
        );
      }

      if (parsed.external_links?.length) {
        await trx("project_external_links").insert(
          parsed.external_links.map((item) => ({
            project_id: project.id,
            url: item.url,
            label: item.label,
          })),
        );
      }

      return project;
    });

    return res.status(201).json({ success: true, data: { project: created } });
  } catch (error) {
    return next(error);
  }
};

exports.updateProject = async function updateProject(req, res, next) {
  try {
    const { clubId, projectId } = paramsSchema.parse(req.params);
    const collaborators = normalizeArray(req.body.collaborators);
    const external_links = normalizeArray(req.body.external_links);

    const parsed = updateProjectSchema.parse({
      ...req.body,
      collaborators,
      external_links,
    });

    const project = await ensureProject(clubId, projectId, req.universityId);
    if (!canEditProject(project, req)) {
      throw createHttpError(403, "FORBIDDEN", "Not allowed to update project");
    }

    const updated = await db.transaction(async (trx) => {
      const updatePayload = {};
      for (const key of [
        "title",
        "description",
        "start_date",
        "end_date",
        "status",
        "visibility",
        "outcome",
      ]) {
        if (parsed[key] !== undefined) updatePayload[key] = parsed[key];
      }

      if (Object.keys(updatePayload).length) {
        await trx("projects").where({ id: projectId }).update(updatePayload);
      }

      if (parsed.collaborators !== undefined) {
        await trx("project_collaborators").where({ project_id: projectId }).del();
        if (parsed.collaborators.length) {
          await trx("project_collaborators").insert(
            parsed.collaborators.map((item) => ({
              project_id: projectId,
              user_id: item.user_id,
              role: item.role || null,
            })),
          );
        }
      }

      if (parsed.external_links !== undefined) {
        await trx("project_external_links").where({ project_id: projectId }).del();
        if (parsed.external_links.length) {
          await trx("project_external_links").insert(
            parsed.external_links.map((item) => ({
              project_id: projectId,
              url: item.url,
              label: item.label,
            })),
          );
        }
      }

      return trx("projects").where({ id: projectId }).first();
    });

    return res.status(200).json({ success: true, data: { project: updated } });
  } catch (error) {
    return next(error);
  }
};

exports.deleteProject = async function deleteProject(req, res, next) {
  try {
    const { clubId, projectId } = paramsSchema.parse(req.params);
    const project = await ensureProject(clubId, projectId, req.universityId);
    if (!canEditProject(project, req)) {
      throw createHttpError(403, "FORBIDDEN", "Not allowed to delete project");
    }

    await db("projects").where({ id: projectId }).del();

    return res.status(200).json({
      success: true,
      data: { message: "Project deleted" },
    });
  } catch (error) {
    return next(error);
  }
};

exports.getClubProjects = async function getClubProjects(req, res, next) {
  try {
    const { clubId } = paramsSchema.parse(req.params);
    const parsed = projectsQuerySchema.parse(req.query);
    const { page, limit, status } = parsed;
    const offset = (page - 1) * limit;

    await ensureClub(clubId, req.universityId);
    const membership = await getMembership(clubId, req.userId);

    const query = db("projects as p")
      .where({ "p.club_id": clubId })
      .modify((q) => {
        if (status) q.andWhere("p.status", status);
        if (!membership) q.andWhere("p.visibility", "public");
      })
      .select(
        "p.*",
        db.raw("(SELECT COUNT(*) FROM project_likes pl WHERE pl.project_id = p.id) as likes_count"),
        db.raw(
          "EXISTS (SELECT 1 FROM project_likes pl2 WHERE pl2.project_id = p.id AND pl2.user_id = ?) as liked_by_me",
          [req.userId],
        ),
      )
      .orderBy("p.created_at", "desc")
      .offset(offset)
      .limit(limit);

    const items = await query;

    return res.status(200).json({ success: true, data: { items, page, limit } });
  } catch (error) {
    return next(error);
  }
};

exports.getProject = async function getProject(req, res, next) {
  try {
    const { clubId, projectId } = paramsSchema.parse(req.params);
    const project = await ensureProject(clubId, projectId, req.universityId);

    if (project.visibility === "members_only") {
      const membership = await getMembership(clubId, req.userId);
      if (!membership) {
        throw createHttpError(403, "FORBIDDEN", "Members-only project");
      }
    }

    const [media, collaborators, external_links, likesRow, likedRow] =
      await Promise.all([
        db("project_media")
          .where({ project_id: projectId })
          .orderBy("id", "desc"),
        db("project_collaborators as pc")
          .leftJoin("users as u", "u.id", "pc.user_id")
          .select(
            "pc.user_id",
            "pc.role",
            "u.first_name",
            "u.last_name",
            "u.profile_image_url",
          )
          .where({ "pc.project_id": projectId }),
        db("project_external_links").where({ project_id: projectId }),
        db("project_likes").where({ project_id: projectId }).count("* as count").first(),
        db("project_likes")
          .where({ project_id: projectId, user_id: req.userId })
          .first(),
      ]);

    return res.status(200).json({
      success: true,
      data: {
        project: {
          ...project,
          media,
          collaborators,
          external_links,
          likes_count: Number(likesRow?.count || 0),
          liked_by_me: Boolean(likedRow),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.toggleLike = async function toggleLike(req, res, next) {
  try {
    const { clubId, projectId } = paramsSchema.parse(req.params);
    const project = await ensureProject(clubId, projectId, req.universityId);

    if (project.visibility === "members_only") {
      const membership = await getMembership(clubId, req.userId);
      if (!membership) {
        throw createHttpError(403, "FORBIDDEN", "Members-only project");
      }
    }

    const result = await db.transaction(async (trx) => {
      const existing = await trx("project_likes")
        .where({ project_id: projectId, user_id: req.userId })
        .first();

      let liked = false;
      if (existing) {
        await trx("project_likes")
          .where({ project_id: projectId, user_id: req.userId })
          .del();
      } else {
        await trx("project_likes").insert({ project_id: projectId, user_id: req.userId });
        liked = true;
      }

      const countRow = await trx("project_likes")
        .where({ project_id: projectId })
        .count("* as count")
        .first();

      return { liked, likes_count: Number(countRow?.count || 0) };
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

exports.addProjectMedia = async function addProjectMedia(req, res, next) {
  try {
    const { clubId, projectId } = paramsSchema.parse(req.params);
    if (!req.file?.buffer) {
      throw createHttpError(400, "VALIDATION", "file is required");
    }

    const parsed = mediaCreateSchema.parse(req.body);
    const project = await ensureProject(clubId, projectId, req.universityId);
    if (!canEditProject(project, req)) {
      throw createHttpError(403, "FORBIDDEN", "Not allowed to edit project media");
    }

    const uploaded = await uploadByType(req.file, parsed.type);

    const [media] = await db("project_media")
      .insert({
        project_id: projectId,
        url: uploaded.url,
        type: parsed.type,
        caption: parsed.caption || null,
      })
      .returning("*");

    return res.status(201).json({ success: true, data: { media } });
  } catch (error) {
    return next(error);
  }
};

exports.deleteProjectMedia = async function deleteProjectMedia(req, res, next) {
  try {
    const { clubId, projectId, mediaId } = paramsSchema.parse(req.params);
    const project = await ensureProject(clubId, projectId, req.universityId);
    if (!canEditProject(project, req)) {
      throw createHttpError(403, "FORBIDDEN", "Not allowed to delete project media");
    }

    const deleted = await db("project_media")
      .where({ id: mediaId, project_id: projectId })
      .del();

    if (!deleted) throw createHttpError(404, "NOT_FOUND", "Media item not found");

    return res.status(200).json({
      success: true,
      data: { message: "Project media deleted" },
    });
  } catch (error) {
    return next(error);
  }
};
