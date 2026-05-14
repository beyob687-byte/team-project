const db = require("../../db/connection");

function parsePage(value, defaultValue) {
  const n = Number(value ?? defaultValue);
  if (!Number.isFinite(n) || n < 1) return defaultValue;
  return Math.floor(n);
}

exports.getFeatureFlags = async function getFeatureFlags(req, res, next) {
  try {
    const items = await db("feature_flags")
      .where({ university_id: req.universityId })
      .select("university_id", "flag_name", "enabled", "value")
      .orderBy("flag_name", "asc");

    return res.status(200).json({ success: true, data: { items } });
  } catch (error) {
    return next(error);
  }
};

exports.patchFeatureFlag = async function patchFeatureFlag(req, res, next) {
  try {
    const { flagName } = req.params;
    const { enabled, value } = req.body;

    const payload = {};
    if (enabled !== undefined) payload.enabled = Boolean(enabled);
    if (value !== undefined) payload.value = value;

    if (!Object.keys(payload).length) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION", message: "enabled or value is required" },
      });
    }

    await db("feature_flags")
      .insert({
        university_id: req.universityId,
        flag_name: flagName,
        enabled: payload.enabled ?? false,
        value: payload.value ?? null,
      })
      .onConflict(["university_id", "flag_name"])
      .merge(payload);

    const updated = await db("feature_flags")
      .where({ university_id: req.universityId, flag_name: flagName })
      .first();

    return res
      .status(200)
      .json({ success: true, data: { feature_flag: updated } });
  } catch (error) {
    return next(error);
  }
};

exports.getAuditLogs = async function getAuditLogs(req, res, next) {
  try {
    const page = parsePage(req.query.page, 1);
    const limit = Math.min(parsePage(req.query.limit, 50), 200);
    const offset = (page - 1) * limit;

    const query = db("audit_logs")
      .where({ university_id: req.universityId })
      .modify((q) => {
        if (req.query.target_type)
          q.andWhere("target_type", req.query.target_type);
        if (req.query.target_id) q.andWhere("target_id", req.query.target_id);
        if (req.query.actor_id) q.andWhere("actor_id", req.query.actor_id);
        if (req.query.action) q.andWhere("action", req.query.action);
        if (req.query.start_date)
          q.andWhere("timestamp", ">=", req.query.start_date);
        if (req.query.end_date)
          q.andWhere("timestamp", "<=", req.query.end_date);
      });

    const items = await query
      .clone()
      .orderBy("timestamp", "desc")
      .offset(offset)
      .limit(limit);

    return res
      .status(200)
      .json({ success: true, data: { items, page, limit } });
  } catch (error) {
    return next(error);
  }
};

exports.getEmailLogs = async function getEmailLogs(req, res, next) {
  try {
    const page = parsePage(req.query.page, 1);
    const limit = Math.min(parsePage(req.query.limit, 50), 200);
    const offset = (page - 1) * limit;

    const items = await db("email_log as e")
      .leftJoin("users as u", "u.id", "e.user_id")
      .where((q) => {
        q.whereNull("e.user_id").orWhere("u.university_id", req.universityId);
      })
      .select(
        "e.id",
        "e.user_id",
        "e.notification_type",
        "e.sent_at",
        "e.status",
        "u.email",
      )
      .orderBy("e.id", "desc")
      .offset(offset)
      .limit(limit);

    return res
      .status(200)
      .json({ success: true, data: { items, page, limit } });
  } catch (error) {
    return next(error);
  }
};

exports.getRecommendationCache = async function getRecommendationCache(
  req,
  res,
  next,
) {
  try {
    const query = db("recommendation_cache as rc")
      .join("users as u", "u.id", "rc.user_id")
      .join("clubs as c", "c.id", "rc.club_id")
      .where("u.university_id", req.universityId)
      .andWhere("c.university_id", req.universityId)
      .modify((q) => {
        if (req.query.user_id) q.andWhere("rc.user_id", req.query.user_id);
      })
      .select(
        "rc.user_id",
        "rc.club_id",
        "rc.score",
        "rc.explanation",
        "rc.generated_at",
      )
      .orderBy("rc.generated_at", "desc")
      .limit(500);

    const items = await query;
    return res.status(200).json({ success: true, data: { items } });
  } catch (error) {
    return next(error);
  }
};

exports.getSurveyInsights = async function getSurveyInsights(req, res, next) {
  try {
    const { surveyId } = req.params;

    const survey = await db("surveys as s")
      .join("clubs as c", "c.id", "s.club_id")
      .where({ "s.id": surveyId, "c.university_id": req.universityId })
      .select("s.*")
      .first();

    if (!survey) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Survey not found" },
      });
    }

    const [savedInsights, ratingRows] = await Promise.all([
      db("survey_insights").where({ survey_id: surveyId }).first(),
      db("survey_answers as sa")
        .join("survey_questions as sq", "sq.id", "sa.question_id")
        .join("survey_responses as sr", "sr.id", "sa.response_id")
        .where({ "sr.survey_id": surveyId, "sq.question_type": "rating" })
        .select("sa.answer_text", "sq.id as question_id", "sq.question_text"),
    ]);

    const ratingMap = new Map();
    for (const row of ratingRows) {
      const key = String(row.question_id);
      if (!ratingMap.has(key)) {
        ratingMap.set(key, {
          question_id: row.question_id,
          question_text: row.question_text,
          total: 0,
          count: 0,
        });
      }

      const value = Number(row.answer_text);
      if (Number.isFinite(value)) {
        const item = ratingMap.get(key);
        item.total += value;
        item.count += 1;
      }
    }

    const rating_summary = Array.from(ratingMap.values()).map((item) => ({
      question_id: item.question_id,
      question_text: item.question_text,
      average_rating: item.count ? item.total / item.count : null,
      responses_count: item.count,
    }));

    return res.status(200).json({
      success: true,
      data: {
        survey_id: surveyId,
        saved_insights: savedInsights || null,
        computed: {
          rating_summary,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};
