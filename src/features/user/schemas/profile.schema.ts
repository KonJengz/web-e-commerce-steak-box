import { z } from "zod";

const PROFILE_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

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
    name: z
      .string()
      .trim()
      .min(1, "Name is required.")
      .max(100, "Name must be at most 100 characters."),
    removeImage: z.boolean(),
  })
  .refine((data) => !(data.image && data.removeImage), {
    message: "Choose a new image or remove the current one, not both.",
    path: ["image"],
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const PROFILE_IMAGE_ACCEPT = PROFILE_IMAGE_TYPES.join(",");
export const PROFILE_IMAGE_MAX_SIZE_MB = PROFILE_IMAGE_MAX_SIZE / (1024 * 1024);
