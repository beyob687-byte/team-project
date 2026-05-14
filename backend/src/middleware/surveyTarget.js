const db = require("../db/connection");

function createHttpError(statusCode, code, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

module.exports = function surveyTargetMiddleware() {
  return async function surveyTarget(req, res, next) {
    try {
      const { surveyId } = req.params;
      if (!surveyId) {
        throw createHttpError(400, "BAD_REQUEST", "surveyId is required");
      }

      const survey = await db("surveys as s")
        .leftJoin("clubs as c", "c.id", "s.club_id")
        .where({ "s.id": surveyId })
        .select("s.*", "c.university_id")
        .first();

      if (!survey) {
        throw createHttpError(404, "NOT_FOUND", "Survey not found");
      }

      if (
        survey.university_id &&
        req.universityId &&
        String(survey.university_id) !== String(req.universityId)
      ) {
        throw createHttpError(404, "NOT_FOUND", "Survey not found");
      }

      if (survey.status !== "published") {
        throw createHttpError(403, "FORBIDDEN", "Survey is not published");
      }

      let allowed = false;
      if (survey.target_audience === "all_students") {
        allowed = true;
      }

      if (survey.target_audience === "members") {
        const membership = await db("club_memberships")
          .where({
            club_id: survey.club_id,
            user_id: req.userId,
            status: "active",
          })
          .first();
        allowed = Boolean(membership);
      }

      if (survey.target_audience === "event_attendees") {
        const hasRsvp = survey.event_id
          ? await db("event_rsvps")
              .where({ event_id: survey.event_id, user_id: req.userId })
              .first()
          : null;
        const hasAttendance = survey.event_id
          ? await db("attendance_records")
              .where({ event_id: survey.event_id, user_id: req.userId })
              .first()
          : null;
        allowed = Boolean(hasRsvp || hasAttendance);
      }

      if (!allowed) {
        throw createHttpError(
          403,
          "FORBIDDEN",
          "You are not in target audience",
        );
      }

      req.survey = survey;
      req.surveyQuestions = await db("survey_questions")
        .where({ survey_id: survey.id })
        .orderBy("id", "asc");

      return next();
    } catch (error) {
      return next(error);
    }
  };
};
