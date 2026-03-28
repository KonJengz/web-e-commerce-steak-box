import { z } from "zod";

const categoryNameSchema = z
  .string()
  .trim()
  .min(1, "Category name is required.")
  .max(100, "Category name must be at most 100 characters.");

const categoryDescriptionSchema = z
  .string()
  .trim()
  .max(500, "Category description must be at most 500 characters.");

export const categoryFormSchema = z.object({
  description: categoryDescriptionSchema,
  name: categoryNameSchema,
});

export const createCategorySchema = categoryFormSchema;

export const updateCategorySchema = categoryFormSchema;

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;

export type CreateCategoryInput = CategoryFormInput;

export type UpdateCategoryInput = CategoryFormInput;
