const { z } = require("zod");

const voteBodySchema = z.object({
  option_id: z.string().uuid(),
});

const pollParamsSchema = z.object({
  clubId: z.string().uuid(),
  postId: z.string().uuid(),
});

module.exports = {
  voteBodySchema,
  pollParamsSchema,
};
