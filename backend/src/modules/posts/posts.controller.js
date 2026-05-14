const db = require("../../db/connection");
const { uploadImage } = require("../../utils/cloudinaryUpload");
const {
  postCreateSchema,
  postUpdateSchema,
  paginationSchema,
} = require("./posts.validation");
const createHttpError = (status, code, message) => {
  const err = new Error(message);
  err.statusCode = status;
  err.code = code;
  return err;
};

exports.createPost = async function createPost(req, res, next) {
  try {
    const parsed = postCreateSchema.parse(req.body);
    // membership check done by middleware; assume req.membership exists

    const images = [];
    if (req.files && req.files.length) {
      for (const file of req.files) {
        const uploaded = await uploadImage(file.buffer, {
          mimeType: file.mimetype,
        });
        images.push(uploaded.url);
      }
    }

    const now = new Date();
    const status = parsed.scheduled_at ? "draft" : "published";

    const [created] = await db("posts")
      .insert({
        club_id: req.params.clubId,
        author_id: req.userId,
        post_type: parsed.post_type,
        content: parsed.content,
        images: images.length ? images : null,
        video_url: parsed.video_url || null,
        linked_event_id: parsed.linked_event_id || null,
        linked_project_id: parsed.linked_project_id || null,
        visibility: parsed.visibility,
        scheduled_at: parsed.scheduled_at || null,
        status,
        moderation_status: "approved",
        created_at: now,
      })
      .returning("*");

    // handle poll creation
    if (parsed.post_type === "poll" && parsed.poll_options?.length) {
      const [poll] = await db("polls")
        .insert({
          post_id: created.id,
          question: parsed.question,
          multiple_choice: parsed.multiple_choice ?? false,
          results_visibility: parsed.results_visibility ?? 'after_close',
          expires_at: parsed.expires_at || null,
        })
        .returning("*");

      const options = parsed.poll_options.map((text, idx) => ({
        poll_id: poll.id,
        option_text: text,
        sort_order: idx,
      }));

      await db("poll_options").insert(options);
    }

    return res.status(201).json({ success: true, data: { post: created } });
  } catch (error) {
    return next(error);
  }
};

exports.getClubPosts = async function getClubPosts(req, res, next) {
  try {
    const parsed = paginationSchema.parse(req.query);
    const { page, limit } = parsed;
    const offset = (page - 1) * limit;

    const baseQuery = db("posts as p")
      .join("clubs as c", "c.id", "p.club_id")
      .where({ "p.club_id": req.params.clubId })
      .andWhere({ "c.university_id": req.universityId })
      .andWhere("p.status", "published")
      .select(
        "p.*",
        db.raw("CONCAT(u.first_name, ' ', u.last_name) as author_name"),
      )
      .leftJoin("users as u", "u.id", "p.author_id")
      .offset(offset)
      .limit(limit)
      .orderBy("p.published_at", "desc");

    const items = await baseQuery;

    return res
      .status(200)
      .json({ success: true, data: { items, page, limit } });
  } catch (error) {
    return next(error);
  }
};

exports.getPost = async function getPost(req, res, next) {
  try {
    const post = await db("posts as p")
      .select(
        "p.*",
        db.raw("CONCAT(u.first_name, ' ', u.last_name) as author_name"),
      )
      .leftJoin("users as u", "u.id", "p.author_id")
      .where({ "p.id": req.params.postId, "p.club_id": req.params.clubId })
      .first();

    if (!post) throw createHttpError(404, "NOT_FOUND", "Post not found");

    return res.status(200).json({ success: true, data: { post } });
  } catch (error) {
    return next(error);
  }
};

exports.updatePost = async function updatePost(req, res, next) {
  try {
    const parsed = postUpdateSchema.parse(req.body);

    const existing = await db("posts")
      .where({ id: req.params.postId, club_id: req.params.clubId })
      .first();

    if (!existing) throw createHttpError(404, "NOT_FOUND", "Post not found");
    if (
      String(existing.author_id) !== String(req.userId) &&
      req.membership.role !== "president"
    ) {
      throw createHttpError(
        403,
        "FORBIDDEN",
        "Only author or president can update",
      );
    }

    const updateData = {};
    if (parsed.content !== undefined) updateData.content = parsed.content;
    if (parsed.visibility !== undefined)
      updateData.visibility = parsed.visibility;
    if (parsed.scheduled_at !== undefined)
      updateData.scheduled_at = parsed.scheduled_at;

    const [updated] = await db("posts")
      .where({ id: req.params.postId })
      .update(updateData)
      .returning("*");

    return res.status(200).json({ success: true, data: { post: updated } });
  } catch (error) {
    return next(error);
  }
};

exports.deletePost = async function deletePost(req, res, next) {
  try {
    const existing = await db("posts")
      .where({ id: req.params.postId, club_id: req.params.clubId })
      .first();

    if (!existing) throw createHttpError(404, "NOT_FOUND", "Post not found");
    if (
      String(existing.author_id) !== String(req.userId) &&
      req.membership.role !== "president"
    ) {
      throw createHttpError(
        403,
        "FORBIDDEN",
        "Only author or president can delete",
      );
    }

    await db("posts")
      .where({ id: req.params.postId })
      .update({ status: "archived" });

    return res
      .status(200)
      .json({ success: true, data: { message: "Post archived" } });
  } catch (error) {
    return next(error);
  }
};

// Comments
exports.createComment = async function createComment(req, res, next) {
  try {
    const { content } = req.body;
    if (!content || !content.trim())
      throw createHttpError(400, "VALIDATION", "Content is required");

    const post = await db("posts")
      .where({ id: req.params.postId, club_id: req.params.clubId })
      .first();
    if (!post) throw createHttpError(404, "NOT_FOUND", "Post not found");

    const [comment] = await db("comments")
      .insert({
        commentable_type: "Post",
        commentable_id: req.params.postId,
        user_id: req.userId,
        content,
        moderation_status: "approved",
      })
      .returning("*");

    return res.status(201).json({ success: true, data: { comment } });
  } catch (error) {
    return next(error);
  }
};

exports.listComments = async function listComments(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const items = await db("comments as c")
      .select(
        "c.*",
        db.raw("CONCAT(u.first_name, ' ', u.last_name) as user_name"),
      )
      .leftJoin("users as u", "u.id", "c.user_id")
      .where({ commentable_type: "Post", commentable_id: req.params.postId })
      .orderBy("c.created_at", "asc")
      .offset(offset)
      .limit(limit);

    return res.status(200).json({ success: true, data: { items } });
  } catch (error) {
    return next(error);
  }
};

exports.deleteComment = async function deleteComment(req, res, next) {
  try {
    const comment = await db("comments")
      .where({ id: req.params.commentId })
      .first();
    if (!comment) throw createHttpError(404, "NOT_FOUND", "Comment not found");

    const membership = req.membership; // may be undefined for non-club contexts
    if (
      String(comment.user_id) !== String(req.userId) &&
      (!membership || membership.role === "member")
    ) {
      throw createHttpError(
        403,
        "FORBIDDEN",
        "Not allowed to delete this comment",
      );
    }

    await db("comments").where({ id: req.params.commentId }).del();

    return res
      .status(200)
      .json({ success: true, data: { message: "Comment deleted" } });
  } catch (error) {
    return next(error);
  }
};
