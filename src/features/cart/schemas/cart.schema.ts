import { z } from "zod";

const productIdSchema = z
  .string()
  .trim()
  .min(1, "Product ID is required.");

export const addToCartSchema = z.object({
  productId: productIdSchema,
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1.")
    .max(999, "Quantity cannot exceed 999."),
});

export const updateCartItemSchema = z.object({
  productId: productIdSchema,
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number.")
    .min(0, "Quantity cannot be negative.")
    .max(999, "Quantity cannot exceed 999."),
});

export const removeCartItemSchema = z.object({
  productId: productIdSchema,
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>;
