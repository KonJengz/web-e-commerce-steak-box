import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .max(255, "Email must be at most 255 characters.")
  .email("Please enter a valid email address.");

const loginPasswordSchema = z
  .string()
  .trim()
  .min(1, "Password is required.")
  .min(6, "Password must be at least 6 characters.")
  .max(128, "Password must be at most 128 characters.");

const registerPasswordSchema = z
  .string()
  .trim()
  .min(1, "Password is required.")
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password must be at most 128 characters.");

const verificationCodeSchema = z
  .string()
  .trim()
  .length(6, "Verification code must be exactly 6 digits.")
  .regex(/^\d+$/, "Verification code must contain only numbers.");

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required.")
      .max(100, "Name must be at most 100 characters."),
    email: emailSchema,
    password: registerPasswordSchema,
    confirmPassword: z
      .string()
      .trim()
      .min(1, "Password is required.")
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must be at most 128 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const verifyEmailSchema = z.object({
  email: emailSchema,
  code: verificationCodeSchema,
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const verifyEmailSubmissionSchema = z.object({
  code: verificationCodeSchema,
});

export type VerifyEmailSubmissionInput = z.infer<
  typeof verifyEmailSubmissionSchema
>;

export const resendVerificationSchema = z.object({
  email: emailSchema,
});

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
