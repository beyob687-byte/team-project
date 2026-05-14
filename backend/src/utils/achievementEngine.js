const db = require("../db/connection");

async function getAchievementByCode(code, client = db) {
  return client("achievements").where({ code }).first();
}

async function awardUserAchievementIfMissing(userId, achievementCode, client = db) {
  const achievement = await getAchievementByCode(achievementCode, client);
  if (!achievement) return null;

  const existing = await client("user_achievements")
    .where({ user_id: userId, achievement_id: achievement.id })
    .first();

  if (existing) return existing;

  const [created] = await client("user_achievements")
    .insert({ user_id: userId, achievement_id: achievement.id })
    .returning("*");

  return created;
}

async function checkEventEnthusiast(userId, client = db) {
  const countRow = await client("attendance_records")
    .where({ user_id: userId })
    .count("* as count")
    .first();

  const attendedCount = Number(countRow?.count || 0);
  if (attendedCount >= 10) {
    return awardUserAchievementIfMissing(userId, "event_enthusiast", client);
  }

  return null;
}

async function checkConnector(userId, client = db) {
  const countRow = await client("club_memberships")
    .where({ user_id: userId, status: "active" })
    .count("* as count")
    .first();

  const membershipCount = Number(countRow?.count || 0);
  if (membershipCount >= 3) {
    return awardUserAchievementIfMissing(userId, "connector", client);
  }

  return null;
}

async function evaluateAll(userId, client = db) {
  const awarded = [];
  const a = await checkEventEnthusiast(userId, client);
  if (a) awarded.push(a);

  const b = await checkConnector(userId, client);
  if (b) awarded.push(b);

  return awarded;
}

module.exports = {
  evaluateAll,
  checkEventEnthusiast,
  checkConnector,
  awardUserAchievementIfMissing,
};
