const { z } = require("zod");

const awardAchievementSchema = z
  .object({
    user_id: z.string().uuid().optional(),
    club_id: z.string().uuid().optional(),
    achievement_code: z.string().trim().min(1).max(50),
  })
  .refine((v) => Boolean(v.user_id) !== Boolean(v.club_id), {
    message: "Exactly one of user_id or club_id is required",
    path: ["user_id"],
  });

module.exports = {
  awardAchievementSchema,
};
