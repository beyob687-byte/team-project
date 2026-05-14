const { z } = require("zod");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[0-9]/, "Password must contain at least one digit.");

const emailSchema = z
  .string()
  .email("Please provide a valid email address.")
  .transform((value) => value.trim().toLowerCase());

const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  first_name: z.string().trim().min(1, "First name is required.").max(100),
  last_name: z.string().trim().min(1, "Last name is required.").max(100),
  student_id: z.string().trim().min(1).max(50).optional(),
  interests: z.array(z.string().trim().min(1)).optional(),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

module.exports = {
  signupSchema,
  loginSchema,
};
