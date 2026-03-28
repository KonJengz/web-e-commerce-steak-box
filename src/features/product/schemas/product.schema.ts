import { z } from "zod";

const PRODUCT_IMAGE_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
const productStatusValues = ["active", "inactive"] as const;

export const PRODUCT_IMAGE_ACCEPT = PRODUCT_IMAGE_ACCEPTED_TYPES.join(",");
export const PRODUCT_IMAGE_MAX_COUNT = 4;
export const PRODUCT_IMAGE_MAX_SIZE_MB = 5;

const requiredCategoryIdSchema = z
  .string()
  .trim()
  .min(1, "Please choose a category.");

const optionalCategoryIdSchema = z.string().trim();

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

const productStatusSchema = z.enum(productStatusValues);

const isFileLike = (value: unknown): value is File => {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as File).name === "string" &&
    typeof (value as File).size === "number" &&
    typeof (value as File).type === "string"
  );
};

export const productImageSchema = z
  .custom<File>((value) => isFileLike(value), {
    message: "Please choose a valid image file.",
  })
  .refine((file) => PRODUCT_IMAGE_ACCEPTED_TYPES.includes(file.type as (typeof PRODUCT_IMAGE_ACCEPTED_TYPES)[number]), {
    message: "Please choose JPG, PNG, or WEBP images only.",
  })
  .refine(
    (file) => file.size <= PRODUCT_IMAGE_MAX_SIZE_MB * 1024 * 1024,
    {
      message: `Each image must be ${PRODUCT_IMAGE_MAX_SIZE_MB} MB or smaller.`,
    },
  );

export const createProductSchema = z.object({
  categoryId: requiredCategoryIdSchema,
  currentPrice: currentPriceSchema,
  description: descriptionSchema,
  images: z
    .array(productImageSchema)
    .max(
      PRODUCT_IMAGE_MAX_COUNT,
      `You can upload up to ${PRODUCT_IMAGE_MAX_COUNT} product images.`,
    )
    .default([]),
  name: nameSchema,
  stock: stockSchema,
});

export const updateProductSchema = z.object({
  categoryId: optionalCategoryIdSchema,
  coverImage: productImageSchema.optional(),
  currentPrice: currentPriceSchema,
  description: descriptionSchema,
  isActive: productStatusSchema,
  name: nameSchema,
  stock: stockSchema,
});

export type CreateProductFormValues = z.input<typeof createProductSchema>;
export type CreateProductInput = z.output<typeof createProductSchema>;
export type CreateProductCoreInput = Omit<CreateProductInput, "images">;
export type UpdateProductFormValues = z.input<typeof updateProductSchema>;
export type UpdateProductInput = z.output<typeof updateProductSchema>;
export type UpdateProductCoreInput = Omit<UpdateProductInput, "coverImage">;
