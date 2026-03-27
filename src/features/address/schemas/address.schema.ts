import { z } from "zod";

const phonePattern = /^[0-9+\-\s()]+$/;

const recipientNameSchema = z
  .string()
  .trim()
  .min(1, "Recipient name is required.")
  .max(120, "Recipient name must be at most 120 characters.");

const phoneSchema = z
  .string()
  .trim()
  .min(8, "Phone number must be at least 8 characters.")
  .max(20, "Phone number must be at most 20 characters.")
  .regex(
    phonePattern,
    "Phone number can only include digits, spaces, parentheses, plus, and hyphen.",
  );

const addressLineSchema = z
  .string()
  .trim()
  .min(1, "Address line is required.")
  .max(255, "Address line must be at most 255 characters.");

const citySchema = z
  .string()
  .trim()
  .min(1, "City is required.")
  .max(120, "City must be at most 120 characters.");

const postalCodeSchema = z
  .string()
  .trim()
  .min(3, "Postal code must be at least 3 characters.")
  .max(20, "Postal code must be at most 20 characters.");

export const createAddressSchema = z.object({
  addressLine: addressLineSchema,
  city: citySchema,
  isDefault: z.boolean(),
  phone: phoneSchema,
  postalCode: postalCodeSchema,
  recipientName: recipientNameSchema,
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
