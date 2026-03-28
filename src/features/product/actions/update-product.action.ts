"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import {
  executeWithAdminServerAuthRetry,
  isServerAdminAuthorizationRequiredError,
  isServerAuthRequiredError,
} from "@/features/auth/services/server-auth-execution.service";
import { updateProductSchema } from "@/features/product/schemas/product.schema";
import { productService } from "@/features/product/services/product.service";
import type {
  ProductUploadedImage,
  UpdateProductActionState,
} from "@/features/product/types/product.type";
import { ApiError } from "@/lib/api/error";

const updateProductActionSchema = updateProductSchema.extend({
  productId: z.string().uuid("Invalid product id."),
});

type UpdateProductActionInput = z.input<typeof updateProductActionSchema>;

const normalizeUpdateProductInput = (
  input: FormData | UpdateProductActionInput,
): UpdateProductActionInput => {
  if (input instanceof FormData) {
    const categoryId = input.get("categoryId");
    const coverImageValue = input.get("coverImage");
    const currentPrice = input.get("currentPrice");
    const description = input.get("description");
    const isActive = input.get("isActive");
    const name = input.get("name");
    const productId = input.get("productId");
    const stock = input.get("stock");
    const coverImage =
      coverImageValue instanceof File &&
      coverImageValue.size > 0 &&
      coverImageValue.name.length > 0
        ? coverImageValue
        : undefined;

    return {
      categoryId: typeof categoryId === "string" ? categoryId : "",
      coverImage,
      currentPrice: typeof currentPrice === "string" ? currentPrice : "",
      description: typeof description === "string" ? description : "",
      isActive: isActive === "inactive" ? "inactive" : "active",
      name: typeof name === "string" ? name : "",
      productId: typeof productId === "string" ? productId : "",
      stock: typeof stock === "string" ? stock : "",
    };
  }

  return input;
};

const buildUnauthorizedState = (): UpdateProductActionState => {
  return {
    message: "Your session expired. Please sign in again to manage products.",
    requiresReauthentication: true,
    success: false,
  };
};

const buildForbiddenState = (): UpdateProductActionState => {
  return {
    message: "Administrator access is required to manage products.",
    requiresAdmin: true,
    success: false,
  };
};

const buildApiErrorState = (error: ApiError): UpdateProductActionState => {
  if (error.message === "Category not found") {
    return {
      fieldErrors: {
        categoryId: ["The selected category no longer exists."],
      },
      message: "The selected category no longer exists.",
      success: false,
    };
  }

  if (error.message === "Product not found") {
    return {
      message: "This product no longer exists.",
      success: false,
    };
  }

  if (error.message.startsWith("Unsupported image type")) {
    return {
      fieldErrors: {
        coverImage: ["Please choose JPG, PNG, or WEBP images only."],
      },
      message: "Please choose JPG, PNG, or WEBP images only.",
      success: false,
    };
  }

  if (error.message.startsWith("Image is too large")) {
    return {
      fieldErrors: {
        coverImage: ["Each image must be 5 MB or smaller."],
      },
      message: "Each image must be 5 MB or smaller.",
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
        coverImage: [
          "Selected cover image expired before it could be attached. Please choose it again.",
        ],
      },
      message:
        "Selected cover image expired before it could be attached. Please choose it again.",
      success: false,
    };
  }

  return {
    message: error.message,
    success: false,
  };
};

export async function updateProductAction(
  input: FormData | UpdateProductActionInput,
): Promise<UpdateProductActionState> {
  const validatedInput = updateProductActionSchema.safeParse(
    normalizeUpdateProductInput(input),
  );

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    let uploadedCoverImage: ProductUploadedImage | undefined;

    if (validatedInput.data.coverImage) {
      const uploadedCoverImageResult = await executeWithAdminServerAuthRetry(
        (accessToken) =>
          productService.uploadImage(accessToken, validatedInput.data.coverImage!),
      );

      uploadedCoverImage = uploadedCoverImageResult.data;
    }

    await executeWithAdminServerAuthRetry((accessToken) =>
      productService.update(
        accessToken,
        validatedInput.data.productId,
        {
          categoryId: validatedInput.data.categoryId,
          currentPrice: validatedInput.data.currentPrice,
          description: validatedInput.data.description,
          isActive: validatedInput.data.isActive,
          name: validatedInput.data.name,
          stock: validatedInput.data.stock,
        },
        uploadedCoverImage,
      ),
    );

    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    revalidatePath(`/products/${validatedInput.data.productId}`);

    return {
      message: "Product updated successfully.",
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
      message: "Unable to update the product right now. Please try again.",
      success: false,
    };
  }
}
