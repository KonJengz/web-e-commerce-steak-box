import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email("Please enter a valid email address.")
    .min(1, "Email is required.")
    .max(255, "Email must be at most 255 characters.")
    .trim(),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(6, "Password must be at least 6 characters.")
    .max(128, "Password must be at most 128 characters.")
    .trim(),
});

export type LoginInput = z.infer<typeof loginSchema>;
