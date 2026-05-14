const { z } = require("zod");

const projectStatusEnum = z.enum(["planning", "in_progress", "completed"]);
const projectVisibilityEnum = z.enum(["public", "members_only"]);

const collaboratorSchema = z.object({
  user_id: z.string().uuid(),
  role: z.string().trim().min(1).max(50).optional().nullable(),
});

const externalLinkSchema = z.object({
  url: z.string().url(),
  label: z.string().trim().min(1).max(100),
});

const createProjectSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().optional().nullable(),
  start_date: z.string().date().optional().nullable(),
  end_date: z.string().date().optional().nullable(),
  status: projectStatusEnum,
  visibility: projectVisibilityEnum.default("public"),
  outcome: z.string().trim().optional().nullable(),
  collaborators: z.array(collaboratorSchema).optional(),
  external_links: z.array(externalLinkSchema).optional(),
});

const updateProjectSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().optional().nullable(),
  start_date: z.string().date().optional().nullable(),
  end_date: z.string().date().optional().nullable(),
  status: projectStatusEnum.optional(),
  visibility: projectVisibilityEnum.optional(),
  outcome: z.string().trim().optional().nullable(),
  collaborators: z.array(collaboratorSchema).optional(),
  external_links: z.array(externalLinkSchema).optional(),
});

const mediaCreateSchema = z.object({
  type: z.enum(["image", "video", "document"]),
  caption: z.string().trim().max(300).optional().nullable(),
});

const projectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: projectStatusEnum.optional(),
});

const paramsSchema = z.object({
  clubId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  mediaId: z.string().uuid().optional(),
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  mediaCreateSchema,
  projectsQuerySchema,
  paramsSchema,
};
