const db = require("../../db/connection");
const { voteBodySchema, pollParamsSchema } = require("./polls.validation");

function createHttpError(statusCode, code, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

async function ensurePollPostVisible({ clubId, postId, universityId, userId }) {
  const post = await db("posts as p")
    .join("clubs as c", "c.id", "p.club_id")
    .where({
      "p.id": postId,
      "p.club_id": clubId,
      "c.university_id": universityId,
    })
    .select("p.*")
    .first();

  if (!post) throw createHttpError(404, "NOT_FOUND", "Poll post not found");
  if (post.post_type !== "poll") {
    throw createHttpError(400, "INVALID_POST_TYPE", "Post is not a poll");
  }

  if (post.visibility === "members_only") {
    const membership = await db("club_memberships")
      .where({ club_id: clubId, user_id: userId, status: "active" })
      .first();
    if (!membership) {
      throw createHttpError(403, "FORBIDDEN", "Members-only poll");
    }
  }

  const poll = await db("polls").where({ post_id: post.id }).first();
  if (!poll) throw createHttpError(404, "NOT_FOUND", "Poll not found");

  return { post, poll };
}

exports.voteOnPoll = async function voteOnPoll(req, res, next) {
  try {
    const { clubId, postId } = pollParamsSchema.parse(req.params);
    const { option_id } = voteBodySchema.parse(req.body);

    const { poll } = await ensurePollPostVisible({
      clubId,
      postId,
      universityId: req.universityId,
      userId: req.userId,
    });

    if (poll.expires_at && new Date(poll.expires_at) <= new Date()) {
      throw createHttpError(400, "POLL_CLOSED", "Poll is closed");
    }

    const option = await db("poll_options")
      .where({ id: option_id, poll_id: poll.id })
      .first();
    if (!option) throw createHttpError(404, "NOT_FOUND", "Option not found");

    await db.transaction(async (trx) => {
      if (!poll.multiple_choice) {
        await trx("poll_votes")
          .where({ poll_id: poll.id, user_id: req.userId })
          .del();

        await trx("poll_votes").insert({
          poll_id: poll.id,
          option_id,
          user_id: req.userId,
        });
        return;
      }

      const existing = await trx("poll_votes")
        .where({ poll_id: poll.id, option_id, user_id: req.userId })
        .first();

      if (existing) {
        await trx("poll_votes").where({ id: existing.id }).del();
      } else {
        await trx("poll_votes").insert({
          poll_id: poll.id,
          option_id,
          user_id: req.userId,
        });
      }
    });

    return res.status(200).json({ success: true, data: { success: true } });
  } catch (error) {
    return next(error);
  }
};

exports.getPollResults = async function getPollResults(req, res, next) {
  try {
    const { clubId, postId } = pollParamsSchema.parse(req.params);

    const { poll } = await ensurePollPostVisible({
      clubId,
      postId,
      universityId: req.universityId,
      userId: req.userId,
    });

    const now = new Date();
    const isClosed = poll.expires_at ? new Date(poll.expires_at) < now : false;

    const myVotes = await db("poll_votes")
      .where({ poll_id: poll.id, user_id: req.userId })
      .select("option_id");
    const votedOptionSet = new Set(myVotes.map((v) => String(v.option_id)));
    const hasVoted = myVotes.length > 0;

    const counts = await db("poll_votes")
      .where({ poll_id: poll.id })
      .select("option_id")
      .count("id as count")
      .groupBy("option_id");
    const countMap = new Map(
      counts.map((c) => [String(c.option_id), Number(c.count || 0)]),
    );

    const options = await db("poll_options")
      .where({ poll_id: poll.id })
      .orderBy("sort_order", "asc")
      .orderBy("id", "asc");

    let canSeeCounts = false;
    if (poll.results_visibility === "always") canSeeCounts = true;
    if (poll.results_visibility === "after_close" && isClosed) canSeeCounts = true;
    if (poll.results_visibility === "after_vote" && (hasVoted || isClosed)) {
      canSeeCounts = true;
    }

    const responseOptions = options.map((opt) => ({
      id: opt.id,
      option_text: opt.option_text,
      vote_count: canSeeCounts ? countMap.get(String(opt.id)) || 0 : null,
      voted_by_me: canSeeCounts ? votedOptionSet.has(String(opt.id)) : false,
    }));

    const totalVotes = canSeeCounts
      ? responseOptions.reduce((sum, item) => sum + Number(item.vote_count || 0), 0)
      : null;

    return res.status(200).json({
      success: true,
      data: {
        question: poll.question,
        multiple_choice: poll.multiple_choice,
        results_visibility: poll.results_visibility,
        total_votes: totalVotes,
        options: responseOptions,
      },
    });
  } catch (error) {
    return next(error);
  }
};
