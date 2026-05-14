const { z } = require("zod");

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const clubIdParamsSchema = z.object({ clubId: z.string().uuid() });

const eventCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().optional().nullable(),
  event_type: z.enum(["in_person", "virtual", "hybrid"]),
  location: z.string().trim().optional().nullable(),
  virtual_meeting_link: z.string().trim().optional().nullable(),
  start_datetime: z.string().datetime(),
  end_datetime: z.string().datetime(),
  timezone: z.string().trim().optional().default("UTC"),
  visibility: z
    .enum(["public", "club_members", "invite_only"])
    .default("public"),
  rsvp_required: z.boolean().optional().default(false),
  rsvp_opens_at: z.string().datetime().optional().nullable(),
  rsvp_closes_at: z.string().datetime().optional().nullable(),
  capacity: z.number().int().optional().nullable(),
  waitlist_enabled: z.boolean().optional().default(false),
  custom_rsvp_questions: z.any().optional().nullable(),
  checkin_method: z.any().optional().nullable(),
  checkin_code: z.string().trim().optional().nullable(),
});

const eventUpdateSchema = eventCreateSchema.partial();

module.exports = {
  paginationSchema,
  clubIdParamsSchema,
  eventCreateSchema,
  eventUpdateSchema,
};
