const { z } = require("zod");

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const adminDashboardQuerySchema = z.object({}).passthrough();

const adminClubListQuerySchema = paginationSchema.extend({
  status: z.enum(["active", "suspended", "inactive"]).optional(),
  category: z.string().trim().min(1).max(50).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  sortBy: z.enum(["name", "newest", "members"]).default("newest"),
});

const adminClubParamsSchema = z.object({
  clubId: z.string().uuid(),
});

const adminClubStatusSchema = z.object({
  status: z.enum(["active", "suspended", "inactive"]),
});

const adminClubRegistrationQuerySchema = paginationSchema.extend({
  status: z
    .enum(["pending", "approved", "rejected", "conditional"])
    .default("pending"),
});

const adminClubRegistrationDecisionSchema = z.object({
  action: z.enum(["approve", "reject", "conditional"]),
  notes: z.string().trim().max(2000).optional(),
});

const adminUserListQuerySchema = paginationSchema.extend({
  role: z.enum(["student", "faculty", "staff"]).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  is_active: z.coerce.boolean().optional(),
});

const adminUserParamsSchema = z.object({
  userId: z.string().uuid(),
});

const adminUserStatusSchema = z.object({
  is_active: z.boolean(),
});

module.exports = {
  paginationSchema,
  adminDashboardQuerySchema,
  adminClubListQuerySchema,
  adminClubParamsSchema,
  adminClubStatusSchema,
  adminClubRegistrationQuerySchema,
  adminClubRegistrationDecisionSchema,
  adminUserListQuerySchema,
  adminUserParamsSchema,
  adminUserStatusSchema,
};
