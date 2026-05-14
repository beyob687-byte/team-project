const db = require("../../db/connection");
const { awardAchievementSchema } = require("./achievements.validation");

function createHttpError(statusCode, code, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

exports.listDefinitions = async function listDefinitions(req, res, next) {
  try {
    const items = await db("achievements").select(
      "id",
      "code",
      "name",
      "description",
      "icon_url",
      "category",
    );
    return res.status(200).json({ success: true, data: { items } });
  } catch (error) {
    return next(error);
  }
};

exports.getUserAchievements = async function getUserAchievements(req, res, next) {
  try {
    const user = await db("users")
      .where({ id: req.params.userId, university_id: req.universityId })
      .first();
    if (!user) throw createHttpError(404, "NOT_FOUND", "User not found");

    const items = await db("user_achievements as ua")
      .join("achievements as a", "a.id", "ua.achievement_id")
      .where({ "ua.user_id": req.params.userId })
      .select(
        "ua.id",
        "ua.awarded_at",
        "a.code",
        "a.name",
        "a.description",
        "a.icon_url",
        "a.category",
      )
      .orderBy("ua.awarded_at", "desc");

    return res.status(200).json({ success: true, data: { items } });
  } catch (error) {
    return next(error);
  }
};

exports.getClubAchievements = async function getClubAchievements(req, res, next) {
  try {
    const club = await db("clubs")
      .where({ id: req.params.clubId, university_id: req.universityId })
      .first();
    if (!club) throw createHttpError(404, "NOT_FOUND", "Club not found");

    const items = await db("club_achievements as ca")
      .join("achievements as a", "a.id", "ca.achievement_id")
      .where({ "ca.club_id": req.params.clubId })
      .select(
        "ca.id",
        "ca.awarded_at",
        "a.code",
        "a.name",
        "a.description",
        "a.icon_url",
        "a.category",
      )
      .orderBy("ca.awarded_at", "desc");

    return res.status(200).json({ success: true, data: { items } });
  } catch (error) {
    return next(error);
  }
};

exports.awardAchievement = async function awardAchievement(req, res, next) {
  try {
    const parsed = awardAchievementSchema.parse(req.body);

    const achievement = await db("achievements")
      .where({ code: parsed.achievement_code })
      .first();
    if (!achievement) {
      throw createHttpError(404, "NOT_FOUND", "Achievement definition not found");
    }

    const awarded = await db.transaction(async (trx) => {
      if (parsed.user_id) {
        const user = await trx("users")
          .where({ id: parsed.user_id, university_id: req.universityId })
          .first();
        if (!user) throw createHttpError(404, "NOT_FOUND", "User not found");

        const existing = await trx("user_achievements")
          .where({ user_id: parsed.user_id, achievement_id: achievement.id })
          .first();
        if (existing) return { target: "user", record: existing, duplicate: true };

        const [record] = await trx("user_achievements")
          .insert({ user_id: parsed.user_id, achievement_id: achievement.id })
          .returning("*");

        return { target: "user", record, duplicate: false };
      }

      const club = await trx("clubs")
        .where({ id: parsed.club_id, university_id: req.universityId })
        .first();
      if (!club) throw createHttpError(404, "NOT_FOUND", "Club not found");

      const existing = await trx("club_achievements")
        .where({ club_id: parsed.club_id, achievement_id: achievement.id })
        .first();
      if (existing) return { target: "club", record: existing, duplicate: true };

      const [record] = await trx("club_achievements")
        .insert({ club_id: parsed.club_id, achievement_id: achievement.id })
        .returning("*");

      return { target: "club", record, duplicate: false };
    });

    return res.status(201).json({ success: true, data: awarded });
  } catch (error) {
    return next(error);
  }
};
