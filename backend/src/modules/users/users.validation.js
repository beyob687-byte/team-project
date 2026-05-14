const { z } = require("zod");

const updateProfileSchema = z.object({
  first_name: z.string().trim().min(1).max(100).optional(),
  last_name: z.string().trim().min(1).max(100).optional(),
  major: z.string().trim().min(1).max(100).optional(),
  department: z.string().trim().min(1).max(100).optional(),
  bio: z.string().trim().max(5000).optional(),
  interests: z.array(z.string().trim().min(1)).optional(),
  profile_image_url: z.string().url().max(500).optional(),
  student_id: z.string().trim().min(1).max(50).optional(),
});

const updatePreferencesSchema = z.object({
  notification_preferences: z.record(z.any()),
});

module.exports = {
  updateProfileSchema,
  updatePreferencesSchema,
};
