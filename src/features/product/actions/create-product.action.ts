"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import {
  executeWithAdminServerAuthRetry,
  isServerAdminAuthorizationRequiredError,
  isServerAuthRequiredError,
} from "@/features/auth/services/server-auth-execution.service";
import { createProductSchema } from "@/features/product/schemas/product.schema";
import { productService } from "@/features/product/services/product.service";
import type {
  CreateProductActionState,
  ProductUploadedImage,
} from "@/features/product/types/product.type";
import { PUBLIC_PRODUCTS_CACHE_TAG } from "@/lib/cache-tags";
import { ApiError } from "@/lib/api/error";

const getCreateProductInput = (
  formData: FormData,
): z.input<typeof createProductSchema> => {
  const categoryId = formData.get("categoryId");
  const currentPrice = formData.get("currentPrice");
  const description = formData.get("description");
  const images = formData
    .getAll("images")
    .filter(
      (value): value is File =>
        value instanceof File && value.size > 0 && value.name.length > 0,
    );
  const name = formData.get("name");
  const stock = formData.get("stock");

  return {
    categoryId: typeof categoryId === "string" ? categoryId : "",
    currentPrice: typeof currentPrice === "string" ? currentPrice : "",
    description: typeof description === "string" ? description : "",
    images,
    name: typeof name === "string" ? name : "",
    stock: typeof stock === "string" ? stock : "",
  };
};

const buildUnauthorizedState = (): CreateProductActionState => {
  return {
    message: "Your session expired. Please sign in again to manage products.",
    requiresReauthentication: true,
    success: false,
  };
};

const buildForbiddenState = (): CreateProductActionState => {
  return {
    message: "Administrator access is required to manage products.",
    requiresAdmin: true,
    success: false,
  };
};

const buildApiErrorState = (error: ApiError): CreateProductActionState => {
  if (error.message === "Category not found") {
    return {
      fieldErrors: {
        categoryId: ["The selected category no longer exists."],
      },
      message: "The selected category no longer exists.",
      success: false,
    };
  }

  if (error.message.startsWith("Unsupported image type")) {
    return {
      fieldErrors: {
        images: ["Please choose JPG, PNG, or WEBP images only."],
      },
      message: "Please choose JPG, PNG, or WEBP images only.",
      success: false,
    };
  }

  if (error.message.startsWith("Image is too large")) {
    return {
      fieldErrors: {
        images: ["Each image must be 5 MB or smaller."],
      },
      message: "Each image must be 5 MB or smaller.",
      success: false,
    };
  }

  if (
    error.message.includes("maximum of 4 images") ||
    error.message.includes("max 4 images") ||
    error.message.includes("at most 4 images")
  ) {
    return {
      fieldErrors: {
        images: ["A product can include up to 4 images total."],
      },
      message: "A product can include up to 4 images total.",
      success: false,
    };
  }

  if (
    error.message.includes("expired") ||
    error.message.includes("image_public_id") ||
    error.message.includes("recent upload")
  ) {
    return {
      fieldErrors: {
        images: [
          "Selected images expired before they could be attached. Please choose them again.",
        ],
      },
      message:
        "Selected images expired before they could be attached. Please choose them again.",
      success: false,
    };
  }

  return {
    message: error.message,
    success: false,
  };
};

const uploadProductImages = async (
  images: File[],
): Promise<ProductUploadedImage[]> => {
  const uploadedImages: ProductUploadedImage[] = [];

  for (const image of images) {
    const uploadedImage = await executeWithAdminServerAuthRetry((accessToken) =>
      productService.uploadImage(accessToken, image),
    );

    uploadedImages.push(uploadedImage.data);
  }

  return uploadedImages;
};

const attachGalleryImages = async (
  productId: string,
  images: ProductUploadedImage[],
): Promise<number> => {
  let failedUploads = 0;

  for (let index = 0; index < images.length; index += 1) {
    try {
      await executeWithAdminServerAuthRetry((accessToken) =>
        productService.addImage(accessToken, productId, images[index]),
      );
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }

      if (
        isServerAuthRequiredError(error) ||
        isServerAdminAuthorizationRequiredError(error) ||
        (error instanceof ApiError &&
          (error.status === 401 || error.status === 403))
      ) {
        return images.length - index;
      }

      failedUploads += 1;
    }
  }

  return failedUploads;
};

export async function createProductAction(
  formData: FormData,
): Promise<CreateProductActionState> {
  const validatedInput = createProductSchema.safeParse(
    getCreateProductInput(formData),
  );

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    const uploadedImages = await uploadProductImages(validatedInput.data.images);
    const primaryImage = uploadedImages[0];
    const createdProduct = await executeWithAdminServerAuthRetry((accessToken) =>
      productService.create(accessToken, validatedInput.data, primaryImage),
    );
    const failedGalleryUploads = await attachGalleryImages(
      createdProduct.data.id,
      uploadedImages.slice(1),
    );

    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    revalidateTag(PUBLIC_PRODUCTS_CACHE_TAG, "max");

    if (failedGalleryUploads > 0) {
      return {
        message:
          failedGalleryUploads === 1
            ? "Product created, but 1 gallery image could not be attached. Open the product later to finish the gallery."
            : `Product created, but ${failedGalleryUploads} gallery images could not be attached. Open the product later to finish the gallery.`,
        success: true,
        warning: true,
      };
    }

    return {
      message: "Product created successfully.",
      success: true,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (isServerAuthRequiredError(error)) {
      return buildUnauthorizedState();
    }

    if (isServerAdminAuthorizationRequiredError(error)) {
      return buildForbiddenState();
    }

    if (error instanceof ApiError) {
      if (error.status === 403) {
        return buildForbiddenState();
      }

      return buildApiErrorState(error);
    }

    return {
      message: "Unable to create the product right now. Please try again.",
      success: false,
    };
  }
}
