"use server";

import { refresh, revalidatePath, revalidateTag } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import {
  executeWithAdminServerAuthRetry,
  isServerAdminAuthorizationRequiredError,
  isServerAuthRequiredError,
} from "@/features/auth/services/server-auth-execution.service";
import {
  PRODUCT_IMAGE_MAX_COUNT,
  productImageSchema,
} from "@/features/product/schemas/product.schema";
import { productService } from "@/features/product/services/product.service";
import type {
  ProductGalleryActionState,
  ProductUploadedImage,
} from "@/features/product/types/product.type";
import { buildProductPath } from "@/features/product/utils/product-path";
import { PUBLIC_PRODUCTS_CACHE_TAG } from "@/lib/cache-tags";
import { ApiError } from "@/lib/api/error";

const productIdSchema = z.string().uuid("Invalid product id.");
const productImageIdSchema = z.string().uuid("Invalid product image id.");

const addProductImagesActionSchema = z.object({
  images: z
    .array(productImageSchema)
    .min(1, "Choose at least one image to add.")
    .max(
      PRODUCT_IMAGE_MAX_COUNT,
      `You can upload up to ${PRODUCT_IMAGE_MAX_COUNT} product images in one batch.`,
    ),
  productId: productIdSchema,
});

const reorderProductImagesActionSchema = z.object({
  imageIds: z
    .array(productImageIdSchema)
    .min(1, "Gallery order cannot be empty.")
    .max(
      PRODUCT_IMAGE_MAX_COUNT,
      `A product can include up to ${PRODUCT_IMAGE_MAX_COUNT} images total.`,
    )
    .refine((imageIds) => new Set(imageIds).size === imageIds.length, {
      message: "Each gallery image can appear only once in the order.",
    }),
  productId: productIdSchema,
});

const deleteProductImageActionSchema = z.object({
  imageId: productImageIdSchema,
  productId: productIdSchema,
});

type AddProductImagesActionInput = z.input<typeof addProductImagesActionSchema>;
type ReorderProductImagesActionInput = z.input<
  typeof reorderProductImagesActionSchema
>;
type DeleteProductImageActionInput = z.input<
  typeof deleteProductImageActionSchema
>;

const normalizeAddProductImagesInput = (
  input: FormData | AddProductImagesActionInput,
): AddProductImagesActionInput => {
  if (input instanceof FormData) {
    const productId = input.get("productId");
    const images = input
      .getAll("images")
      .filter(
        (value): value is File =>
          value instanceof File && value.size > 0 && value.name.length > 0,
      );

    return {
      images,
      productId: typeof productId === "string" ? productId : "",
    };
  }

  return input;
};

const buildUnauthorizedState = (): ProductGalleryActionState => {
  return {
    message: "Your session expired. Please sign in again to manage product media.",
    requiresReauthentication: true,
    success: false,
  };
};

const buildForbiddenState = (): ProductGalleryActionState => {
  return {
    message: "Administrator access is required to manage product media.",
    requiresAdmin: true,
    success: false,
  };
};

const buildApiErrorState = (error: ApiError): ProductGalleryActionState => {
  if (error.message === "Product not found") {
    return {
      message: "This product no longer exists.",
      success: false,
    };
  }

  if (error.message === "Product image not found") {
    return {
      fieldErrors: {
        imageId: ["That image is no longer available."],
      },
      message: "That image is no longer available.",
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

  if (error.message.includes("image_ids")) {
    return {
      fieldErrors: {
        imageIds: ["Use the current gallery items only when changing the order."],
      },
      message: "The gallery order was out of date. Refresh the modal and try again.",
      success: false,
    };
  }

  return {
    message: error.message,
    success: false,
  };
};

const revalidateProductPaths = async (productId: string): Promise<void> => {
  revalidatePath("/admin/products");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  revalidateTag(PUBLIC_PRODUCTS_CACHE_TAG, "max");
  revalidatePath(buildProductPath(productId));

  try {
    const product = await productService.getByIdentifier(productId);
    revalidatePath(buildProductPath(product.data.slug));
  } catch {
    // Keep admin mutations resilient even if the public lookup is unavailable.
  }
};

const getLatestProductImages = async (
  productId: string,
): Promise<ProductGalleryActionState> => {
  const result = await productService.getImages(productId);

  return {
    images: result.data,
    success: true,
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
  existingImageCount: number,
  uploadedImages: ProductUploadedImage[],
): Promise<{
  attachedCount: number;
  failedCount: number;
}> => {
  let attachedCount = 0;
  let failedCount = 0;

  for (let index = 0; index < uploadedImages.length; index += 1) {
    try {
      await executeWithAdminServerAuthRetry((accessToken) =>
        productService.addImage(accessToken, productId, uploadedImages[index], {
          isPrimary: existingImageCount === 0 && index === 0,
        }),
      );
      attachedCount += 1;
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }

      if (isServerAuthRequiredError(error)) {
        throw error;
      }

      if (isServerAdminAuthorizationRequiredError(error)) {
        throw error;
      }

      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        throw error;
      }

      failedCount += 1;
    }
  }

  return {
    attachedCount,
    failedCount,
  };
};

export async function getProductImagesAction(
  productId: string,
): Promise<ProductGalleryActionState> {
  const validatedInput = productIdSchema.safeParse(productId);

  if (!validatedInput.success) {
    return {
      fieldErrors: {
        productId: validatedInput.error.flatten().formErrors,
      },
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    return getLatestProductImages(validatedInput.data);
  } catch (error) {
    if (error instanceof ApiError) {
      return buildApiErrorState(error);
    }

    return {
      message: "Unable to load the product gallery right now. Please try again.",
      success: false,
    };
  }
}

export async function addProductImagesAction(
  input: FormData | AddProductImagesActionInput,
): Promise<ProductGalleryActionState> {
  const validatedInput = addProductImagesActionSchema.safeParse(
    normalizeAddProductImagesInput(input),
  );

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    const currentImages = await productService.getImages(validatedInput.data.productId);
    const remainingSlots =
      PRODUCT_IMAGE_MAX_COUNT - currentImages.data.length;

    if (validatedInput.data.images.length > remainingSlots) {
      return {
        fieldErrors: {
          images: [
            remainingSlots > 0
              ? `Only ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"} can be added right now.`
              : "This product already has the maximum of 4 images.",
          ],
        },
        message:
          remainingSlots > 0
            ? `Only ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"} can be added right now.`
            : "This product already has the maximum of 4 images.",
        images: currentImages.data,
        success: false,
      };
    }

    const uploadedImages = await uploadProductImages(validatedInput.data.images);
    const { attachedCount, failedCount } = await attachGalleryImages(
      validatedInput.data.productId,
      currentImages.data.length,
      uploadedImages,
    );
    const latestImages = await getLatestProductImages(validatedInput.data.productId);

    await revalidateProductPaths(validatedInput.data.productId);
    refresh();

    if (!latestImages.success) {
      return latestImages;
    }

    if (attachedCount === 0 && failedCount > 0) {
      return {
        ...latestImages,
        message: "Selected images could not be attached. Please try again.",
        success: false,
      };
    }

    if (failedCount > 0) {
      return {
        ...latestImages,
        message:
          failedCount === 1
            ? "Gallery updated, but 1 image could not be attached."
            : `Gallery updated, but ${failedCount} images could not be attached.`,
        success: true,
        warning: true,
      };
    }

    return {
      ...latestImages,
      message:
        attachedCount === 1
          ? "1 image added to the gallery."
          : `${attachedCount} images added to the gallery.`,
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
      message: "Unable to attach images right now. Please try again.",
      success: false,
    };
  }
}

export async function reorderProductImagesAction(
  input: ReorderProductImagesActionInput,
): Promise<ProductGalleryActionState> {
  const validatedInput = reorderProductImagesActionSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    await executeWithAdminServerAuthRetry((accessToken) =>
      productService.reorderImages(
        accessToken,
        validatedInput.data.productId,
        validatedInput.data.imageIds,
      ),
    );

    await revalidateProductPaths(validatedInput.data.productId);
    refresh();

    return {
      ...(await getLatestProductImages(validatedInput.data.productId)),
      message: "Gallery order updated.",
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
      message: "Unable to update the gallery order right now. Please try again.",
      success: false,
    };
  }
}

export async function deleteProductImageAction(
  input: DeleteProductImageActionInput,
): Promise<ProductGalleryActionState> {
  const validatedInput = deleteProductImageActionSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    await executeWithAdminServerAuthRetry((accessToken) =>
      productService.removeImage(
        accessToken,
        validatedInput.data.productId,
        validatedInput.data.imageId,
      ),
    );

    await revalidateProductPaths(validatedInput.data.productId);
    refresh();

    return {
      ...(await getLatestProductImages(validatedInput.data.productId)),
      message: "Image removed from the product gallery.",
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
      message: "Unable to remove this image right now. Please try again.",
      success: false,
    };
  }
}
