import { z } from "zod";

const categoryNameSchema = z
  .string()
  .trim()
  .min(1, "Category name is required.")
  .max(100, "Category name must be at most 100 characters.");

const categoryDescriptionSchema = z
  .string()
  .trim()
  .min(1, "Category description is required.")
  .max(500, "Category description must be at most 500 characters.");

export const createCategorySchema = z.object({
  description: categoryDescriptionSchema,
  name: categoryNameSchema,
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
