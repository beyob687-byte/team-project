const { z } = require("zod");

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const clubIdParamsSchema = z.object({
  clubId: z.string().uuid(),
});

const postCreateSchema = z.object({
  content: z.string().trim().min(1),
  post_type: z
    .enum(["general", "event_promotion", "project_highlight", "poll"]) // eslint-disable-line
    .optional()
    .default("general"),
  video_url: z.string().url().optional().nullable(),
  linked_event_id: z.string().uuid().optional().nullable(),
  linked_project_id: z.string().uuid().optional().nullable(),
  visibility: z.enum(["public", "members_only"]).default("public"),
  scheduled_at: z.string().datetime().optional().nullable(),
  // Poll fields
  question: z.string().trim().min(1).optional(),
  poll_options: z.array(z.string().trim().min(1)).optional(),
  multiple_choice: z.boolean().optional().default(false),
  expires_at: z.string().datetime().optional().nullable(),
  results_visibility: z
    .enum(["always", "after_vote", "after_close"])
    .optional()
    .default("after_close"),
});

const postUpdateSchema = z.object({
  content: z.string().trim().min(1).optional(),
  visibility: z.enum(["public", "members_only"]).optional(),
  scheduled_at: z.string().datetime().optional().nullable(),
});

module.exports = {
  paginationSchema,
  clubIdParamsSchema,
  postCreateSchema,
  postUpdateSchema,
};
