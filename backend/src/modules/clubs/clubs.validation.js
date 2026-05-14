const { z } = require("zod");

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const clubIdParamsSchema = z.object({
  clubId: z.string().uuid(),
});

const publicClubListQuerySchema = paginationSchema.extend({
  category: z.string().trim().min(1).max(50).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  sortBy: z.enum(["name", "newest", "members"]).default("newest"),
});

const clubProfileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  short_name: z.string().trim().min(2).max(50).nullable().optional(),
  category: z.string().trim().min(2).max(50).optional(),
  secondary_categories: z.array(z.string().trim().min(1).max(50)).optional(),
  mission_statement: z.string().trim().max(5000).nullable().optional(),
  logo_url: z.string().url().max(500).nullable().optional(),
  cover_photo_url: z.string().url().max(500).nullable().optional(),
  contact_email: z.string().email().max(320).optional(),
  social_links: z.record(z.any()).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(50)).optional(),
  meeting_schedule: z.record(z.any()).nullable().optional(),
  recruiting_status: z.boolean().optional(),
  faculty_advisor_name: z.string().trim().max(100).nullable().optional(),
  faculty_advisor_email: z.string().email().max(320).nullable().optional(),
  constitution_url: z.string().url().max(500).nullable().optional(),
});

const clubMediaCreateSchema = z.object({
  media_url: z.string().url().max(500),
  media_type: z.enum(["image", "video"]),
  caption: z.string().trim().max(300).nullable().optional(),
  sort_order: z.coerce.number().int().default(0),
});

const clubMediaListQuerySchema = z.object({}).passthrough();

const membershipJoinSchema = z.object({}).passthrough();

const membershipRequestsQuerySchema = paginationSchema.extend({
  status: z.enum(["pending", "approved", "denied"]).default("pending"),
});

const membershipRequestDecisionSchema = z.object({
  action: z.enum(["approve", "deny"]),
  denial_reason: z.string().trim().max(500).optional(),
});

const inviteMemberSchema = z.object({
  user_email: z.string().email().max(320),
});

const clubMembersQuerySchema = paginationSchema.extend({
  role: z.string().trim().min(1).max(50).optional(),
  status: z.enum(["active", "pending", "suspended", "alumni"]).optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

const roleDefinitionCreateSchema = z.object({
  role_name: z.string().trim().min(2).max(50),
  permissions: z.record(z.any()),
});

const roleDefinitionUpdateSchema = z.object({
  role_name: z.string().trim().min(2).max(50).optional(),
  permissions: z.record(z.any()).optional(),
});

const clubRegistrationSchema = z.object({
  name: z.string().trim().min(2).max(200),
  short_name: z.string().trim().min(2).max(50).nullable().optional(),
  category: z.string().trim().min(2).max(50),
  secondary_categories: z.array(z.string().trim().min(1).max(50)).optional(),
  mission_statement: z.string().trim().max(5000).nullable().optional(),
  contact_email: z.string().email().max(320),
  tags: z.array(z.string().trim().min(1).max(50)).optional(),
  social_links: z.record(z.any()).nullable().optional(),
  logo_url: z.string().url().max(500).nullable().optional(),
  cover_photo_url: z.string().url().max(500).nullable().optional(),
  faculty_advisor_name: z.string().trim().max(100).nullable().optional(),
  faculty_advisor_email: z.string().email().max(320).nullable().optional(),
  constitution_url: z.string().url().max(500).nullable().optional(),
  meeting_schedule: z.record(z.any()).nullable().optional(),
  recruiting_status: z.boolean().optional(),
  membership_policy: z.enum(["open", "approval", "invite_only"]).optional(),
});

module.exports = {
  paginationSchema,
  clubIdParamsSchema,
  publicClubListQuerySchema,
  clubProfileUpdateSchema,
  clubMediaCreateSchema,
  clubMediaListQuerySchema,
  membershipJoinSchema,
  membershipRequestsQuerySchema,
  membershipRequestDecisionSchema,
  inviteMemberSchema,
  clubMembersQuerySchema,
  roleDefinitionCreateSchema,
  roleDefinitionUpdateSchema,
  clubRegistrationSchema,
};
