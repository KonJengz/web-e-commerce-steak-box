import { z } from "zod";

const phonePattern = /^\d{10}$/;
const postalCodePattern = /^\d{5}$/;

const recipientNameSchema = z
  .string()
  .trim()
  .min(1, "Recipient name is required.")
  .max(120, "Recipient name must be at most 120 characters.");

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required.")
  .regex(phonePattern, "Phone number must contain exactly 10 digits.");

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
  .min(1, "Postal code is required.")
  .regex(postalCodePattern, "Postal code must contain exactly 5 digits.");

export const addressFormSchema = z.object({
  addressLine: addressLineSchema,
  city: citySchema,
  isDefault: z.boolean(),
  phone: phoneSchema,
  postalCode: postalCodeSchema,
  recipientName: recipientNameSchema,
});

export const createAddressSchema = addressFormSchema;
export const updateAddressSchema = addressFormSchema;

export type AddressFormInput = z.infer<typeof addressFormSchema>;
export type CreateAddressInput = AddressFormInput;
export type UpdateAddressInput = AddressFormInput;
