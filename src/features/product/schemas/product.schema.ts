import { z } from "zod";

const categoryIdSchema = z
  .string()
  .trim()
  .min(1, "Please choose a category.");

const nameSchema = z
  .string()
  .trim()
  .min(1, "Product name is required.")
  .max(150, "Product name must be at most 150 characters.");

const descriptionSchema = z
  .string()
  .trim()
  .min(1, "Product description is required.")
  .max(3000, "Product description must be at most 3000 characters.");

const currentPriceSchema = z.coerce
  .number()
  .finite("Current price must be a valid number.")
  .positive("Current price must be greater than zero.");

const stockSchema = z.coerce
  .number()
  .int("Stock must be a whole number.")
  .min(0, "Stock cannot be negative.");

export const createProductSchema = z.object({
  categoryId: categoryIdSchema,
  currentPrice: currentPriceSchema,
  description: descriptionSchema,
  name: nameSchema,
  stock: stockSchema,
});

export type CreateProductFormValues = z.input<typeof createProductSchema>;
export type CreateProductInput = z.output<typeof createProductSchema>;
