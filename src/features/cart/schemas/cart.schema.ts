import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z
    .string()
    .trim()
    .min(1, "Product ID is required."),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1.")
    .max(999, "Quantity cannot exceed 999."),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
