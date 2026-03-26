import { z } from "zod";

const PROFILE_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const verificationCodeSchema = z
  .string()
  .trim()
  .length(6, "Verification code must be exactly 6 digits.")
  .regex(/^\d+$/, "Verification code must contain only numbers.");
const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .max(255, "Email must be at most 255 characters.")
  .email("Please enter a valid email address.");
const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required.")
  .max(100, "Name must be at most 100 characters.");

const isFile = (value: unknown): value is File => {
  return typeof File !== "undefined" && value instanceof File;
};

const selectedProfileImageSchema = z
  .custom<File>(isFile, {
    message: "Please choose a valid image file.",
  })
  .refine(
    (file) =>
      PROFILE_IMAGE_TYPES.includes(file.type as (typeof PROFILE_IMAGE_TYPES)[number]),
    {
      message: "Please choose a JPG, PNG, or WEBP image.",
    },
  )
  .refine((file) => file.size <= PROFILE_IMAGE_MAX_SIZE, {
    message: "Image must be 5 MB or smaller.",
  });

const profileImageSchema = z.union([selectedProfileImageSchema, z.undefined()]);

export const updateProfileSchema = z
  .object({
    image: profileImageSchema,
    name: nameSchema.optional(),
    removeImage: z.boolean(),
  })
  .refine((data) => Boolean(data.name) || Boolean(data.image) || data.removeImage, {
    message: "Update at least one profile detail before saving.",
  })
  .refine((data) => !(data.image && data.removeImage), {
    message: "Choose a new image or remove the current one, not both.",
    path: ["image"],
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updateProfileNameSchema = z.object({
  name: nameSchema,
});

export type UpdateProfileNameInput = z.infer<typeof updateProfileNameSchema>;

export const updateProfileImageSchema = z
  .object({
    image: profileImageSchema,
    removeImage: z.boolean(),
  })
  .refine((data) => Boolean(data.image) || data.removeImage, {
    message: "Choose a new image or remove the current one before saving.",
    path: ["image"],
  })
  .refine((data) => !(data.image && data.removeImage), {
    message: "Choose a new image or remove the current one, not both.",
    path: ["image"],
  });

export type UpdateProfileImageInput = z.infer<typeof updateProfileImageSchema>;

export const requestEmailChangeSchema = z.object({
  email: emailSchema,
});

export type RequestEmailChangeInput = z.infer<typeof requestEmailChangeSchema>;

export const verifyEmailChangeSchema = z.object({
  code: verificationCodeSchema,
  email: emailSchema,
});

export type VerifyEmailChangeInput = z.infer<typeof verifyEmailChangeSchema>;

export const verifyEmailChangeCodeSchema = z.object({
  code: verificationCodeSchema,
});

export type VerifyEmailChangeCodeInput = z.infer<
  typeof verifyEmailChangeCodeSchema
>;

export const PROFILE_IMAGE_ACCEPT = PROFILE_IMAGE_TYPES.join(",");
export const PROFILE_IMAGE_MAX_SIZE_MB = PROFILE_IMAGE_MAX_SIZE / (1024 * 1024);
