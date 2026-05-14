const { z } = require("zod");

const surveyQuestionSchema = z.object({
  question_text: z.string().trim().min(1),
  question_type: z.enum(["text", "single_choice", "multi_choice", "rating"]),
  options: z.array(z.string().trim().min(1)).optional().nullable(),
  required: z.boolean().optional().default(false),
});

const createSurveySchema = z.object({
  title: z.string().trim().min(1).max(200),
  target_audience: z.enum(["members", "event_attendees", "all_students"]),
  event_id: z.string().uuid().optional().nullable(),
  questions: z.array(surveyQuestionSchema).min(1),
});

const updateSurveySchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  target_audience: z
    .enum(["members", "event_attendees", "all_students"])
    .optional(),
  event_id: z.string().uuid().optional().nullable(),
  questions: z.array(surveyQuestionSchema).optional(),
});

const updateSurveyStatusSchema = z.object({
  status: z.enum(["published", "closed"]),
});

const listSurveyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["draft", "published", "closed"]).optional(),
});

const submitSurveyResponseSchema = z.object({
  answers: z
    .array(
      z.object({
        question_id: z.string().uuid(),
        answer_text: z.string().optional().nullable(),
        answer_option_ids: z.array(z.string().uuid()).optional().nullable(),
      }),
    )
    .min(1),
});

module.exports = {
  createSurveySchema,
  updateSurveySchema,
  updateSurveyStatusSchema,
  listSurveyQuerySchema,
  submitSurveyResponseSchema,
};
