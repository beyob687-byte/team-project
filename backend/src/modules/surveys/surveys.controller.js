const db = require("../../db/connection");
const {
  createSurveySchema,
  updateSurveySchema,
  updateSurveyStatusSchema,
  listSurveyQuerySchema,
  submitSurveyResponseSchema,
} = require("./surveys.validation");

function createHttpError(statusCode, code, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

async function ensureClub(clubId, universityId) {
  const club = await db("clubs")
    .where({ id: clubId, university_id: universityId })
    .first();
  if (!club) throw createHttpError(404, "NOT_FOUND", "Club not found");
  return club;
}

async function ensureSurvey(surveyId, clubId, universityId) {
  const survey = await db("surveys as s")
    .join("clubs as c", "c.id", "s.club_id")
    .where({ "s.id": surveyId, "s.club_id": clubId, "c.university_id": universityId })
    .select("s.*")
    .first();
  if (!survey) throw createHttpError(404, "NOT_FOUND", "Survey not found");
  return survey;
}

function summarizeResponses(questions, answers) {
  const byQuestion = new Map();
  for (const q of questions) {
    byQuestion.set(String(q.id), {
      question_id: q.id,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options || null,
      total_answers: 0,
      counts: {},
      text_answers: [],
    });
  }

  for (const answer of answers) {
    const bucket = byQuestion.get(String(answer.question_id));
    if (!bucket) continue;

    bucket.total_answers += 1;

    if (bucket.question_type === "text") {
      if (answer.answer_text) bucket.text_answers.push(answer.answer_text);
      continue;
    }

    if (bucket.question_type === "rating") {
      const key = String(answer.answer_text || "").trim();
      if (key) bucket.counts[key] = (bucket.counts[key] || 0) + 1;
      continue;
    }

    if (bucket.question_type === "single_choice") {
      const key = String(answer.answer_text || "").trim();
      if (key) bucket.counts[key] = (bucket.counts[key] || 0) + 1;
      continue;
    }

    if (bucket.question_type === "multi_choice") {
      if (answer.answer_text) {
        try {
          const selected = JSON.parse(answer.answer_text);
          if (Array.isArray(selected)) {
            for (const opt of selected) {
              const key = String(opt).trim();
              if (key) bucket.counts[key] = (bucket.counts[key] || 0) + 1;
            }
            continue;
          }
        } catch (err) {
          // fallthrough to plain text count
        }
      }
      const key = String(answer.answer_text || "").trim();
      if (key) bucket.counts[key] = (bucket.counts[key] || 0) + 1;
    }
  }

  return Array.from(byQuestion.values());
}

exports.createSurvey = async function createSurvey(req, res, next) {
  try {
    const { clubId } = req.params;
    const parsed = createSurveySchema.parse(req.body);

    await ensureClub(clubId, req.universityId);

    if (parsed.event_id) {
      const event = await db("events")
        .where({ id: parsed.event_id, club_id: clubId })
        .first();
      if (!event) {
        throw createHttpError(400, "VALIDATION", "event_id must belong to this club");
      }
    }

    const survey = await db.transaction(async (trx) => {
      const [created] = await trx("surveys")
        .insert({
          club_id: clubId,
          title: parsed.title,
          target_audience: parsed.target_audience,
          event_id: parsed.event_id || null,
          status: "draft",
          created_by: req.userId,
        })
        .returning("*");

      await trx("survey_questions").insert(
        parsed.questions.map((q) => ({
          survey_id: created.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options || null,
          required: q.required || false,
        })),
      );

      return created;
    });

    return res.status(201).json({ success: true, data: { survey } });
  } catch (error) {
    return next(error);
  }
};

exports.updateSurvey = async function updateSurvey(req, res, next) {
  try {
    const { clubId, surveyId } = req.params;
    const parsed = updateSurveySchema.parse(req.body);
    const survey = await ensureSurvey(surveyId, clubId, req.universityId);

    if (survey.status !== "draft") {
      throw createHttpError(400, "INVALID_STATE", "Only draft surveys can be updated");
    }

    const updated = await db.transaction(async (trx) => {
      const payload = {};
      for (const key of ["title", "target_audience", "event_id"]) {
        if (parsed[key] !== undefined) payload[key] = parsed[key];
      }

      if (Object.keys(payload).length > 0) {
        await trx("surveys").where({ id: surveyId }).update(payload);
      }

      if (parsed.questions !== undefined) {
        await trx("survey_questions").where({ survey_id: surveyId }).del();
        if (parsed.questions.length) {
          await trx("survey_questions").insert(
            parsed.questions.map((q) => ({
              survey_id: surveyId,
              question_text: q.question_text,
              question_type: q.question_type,
              options: q.options || null,
              required: q.required || false,
            })),
          );
        }
      }

      return trx("surveys").where({ id: surveyId }).first();
    });

    return res.status(200).json({ success: true, data: { survey: updated } });
  } catch (error) {
    return next(error);
  }
};

exports.updateSurveyStatus = async function updateSurveyStatus(req, res, next) {
  try {
    const { clubId, surveyId } = req.params;
    const { status } = updateSurveyStatusSchema.parse(req.body);

    const survey = await ensureSurvey(surveyId, clubId, req.universityId);

    if (status === "published") {
      const countRow = await db("survey_questions")
        .where({ survey_id: surveyId })
        .count("* as count")
        .first();
      if (Number(countRow?.count || 0) === 0) {
        throw createHttpError(400, "VALIDATION", "Survey must have questions before publishing");
      }
    }

    const [updated] = await db("surveys")
      .where({ id: surveyId })
      .update({ status })
      .returning("*");

    return res.status(200).json({ success: true, data: { survey: updated } });
  } catch (error) {
    return next(error);
  }
};

exports.listClubSurveys = async function listClubSurveys(req, res, next) {
  try {
    const { clubId } = req.params;
    const parsed = listSurveyQuerySchema.parse(req.query);
    const { page, limit, status } = parsed;
    const offset = (page - 1) * limit;

    await ensureClub(clubId, req.universityId);

    const items = await db("surveys")
      .where({ club_id: clubId })
      .modify((q) => {
        if (status) q.andWhere("status", status);
      })
      .orderBy("id", "desc")
      .offset(offset)
      .limit(limit)
      .select("id", "club_id", "title", "target_audience", "event_id", "status", "created_by");

    return res.status(200).json({ success: true, data: { items, page, limit } });
  } catch (error) {
    return next(error);
  }
};

exports.getSurveyForRespondent = async function getSurveyForRespondent(
  req,
  res,
  next,
) {
  try {
    return res.status(200).json({
      success: true,
      data: {
        survey: req.survey,
        questions: req.surveyQuestions,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.submitSurveyResponse = async function submitSurveyResponse(req, res, next) {
  try {
    const { answers } = submitSurveyResponseSchema.parse(req.body);

    const survey = req.survey;
    const questions = req.surveyQuestions || [];

    if (!survey || !questions.length) {
      throw createHttpError(404, "NOT_FOUND", "Survey not available");
    }

    const existing = await db("survey_responses")
      .where({ survey_id: survey.id, user_id: req.userId })
      .first();
    if (existing) {
      throw createHttpError(409, "ALREADY_SUBMITTED", "Survey already submitted");
    }

    const questionMap = new Map(questions.map((q) => [String(q.id), q]));
    const answerMap = new Map(answers.map((a) => [String(a.question_id), a]));

    for (const q of questions) {
      if (!q.required) continue;
      const ans = answerMap.get(String(q.id));
      const hasText = ans?.answer_text && String(ans.answer_text).trim().length > 0;
      const hasOptions = Array.isArray(ans?.answer_option_ids) && ans.answer_option_ids.length > 0;
      if (!ans || (!hasText && !hasOptions)) {
        throw createHttpError(400, "VALIDATION", "Required question is missing an answer");
      }
    }

    await db.transaction(async (trx) => {
      const [response] = await trx("survey_responses")
        .insert({ survey_id: survey.id, user_id: req.userId })
        .returning("*");

      const rows = [];
      for (const item of answers) {
        const q = questionMap.get(String(item.question_id));
        if (!q) continue;

        let answerText = item.answer_text || null;
        if (q.question_type === "multi_choice" && answerText && !answerText.startsWith("[")) {
          answerText = JSON.stringify([answerText]);
        }

        rows.push({
          response_id: response.id,
          question_id: item.question_id,
          answer_text: answerText,
          answer_option_ids: item.answer_option_ids || null,
        });
      }

      if (rows.length) {
        await trx("survey_answers").insert(rows);
      }
    });

    return res
      .status(201)
      .json({ success: true, data: { message: "Survey response submitted" } });
  } catch (error) {
    return next(error);
  }
};

exports.getSurveyResponses = async function getSurveyResponses(req, res, next) {
  try {
    const { clubId, surveyId } = req.params;
    const parsed = listSurveyQuerySchema.parse(req.query);
    const { page, limit } = parsed;
    const offset = (page - 1) * limit;

    await ensureSurvey(surveyId, clubId, req.universityId);

    const [questions, rawAnswers, responses] = await Promise.all([
      db("survey_questions").where({ survey_id: surveyId }).orderBy("id", "asc"),
      db("survey_answers as sa")
        .join("survey_responses as sr", "sr.id", "sa.response_id")
        .where({ "sr.survey_id": surveyId })
        .select("sa.question_id", "sa.answer_text", "sa.answer_option_ids"),
      db("survey_responses as sr")
        .leftJoin("users as u", "u.id", "sr.user_id")
        .where({ "sr.survey_id": surveyId })
        .select(
          "sr.id",
          "sr.user_id",
          "sr.submitted_at",
          "u.first_name",
          "u.last_name",
          "u.email",
        )
        .orderBy("sr.submitted_at", "desc")
        .offset(offset)
        .limit(limit),
    ]);

    const summary = summarizeResponses(questions, rawAnswers);

    return res.status(200).json({
      success: true,
      data: {
        responses,
        summary,
        page,
        limit,
      },
    });
  } catch (error) {
    return next(error);
  }
};
