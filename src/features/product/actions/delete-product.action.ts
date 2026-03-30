"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import {
  executeWithAdminServerAuthRetry,
  isServerAdminAuthorizationRequiredError,
  isServerAuthRequiredError,
} from "@/features/auth/services/server-auth-execution.service";
import { productService } from "@/features/product/services/product.service";
import type { DeleteProductActionState } from "@/features/product/types/product.type";
import { PUBLIC_PRODUCTS_CACHE_TAG } from "@/lib/cache-tags";
import { ApiError } from "@/lib/api/error";

const buildUnauthorizedState = async (): Promise<DeleteProductActionState> => {
  return {
    message: "Your session expired. Please sign in again to manage products.",
    requiresReauthentication: true,
    success: false,
  };
};

const buildForbiddenState = (): DeleteProductActionState => {
  return {
    message: "Administrator access is required to manage products.",
    requiresAdmin: true,
    success: false,
  };
};

export async function deleteProductAction(
  productId: string,
): Promise<DeleteProductActionState> {
  try {
    await executeWithAdminServerAuthRetry((accessToken) =>
      productService.remove(accessToken, productId),
    );

    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    revalidateTag(PUBLIC_PRODUCTS_CACHE_TAG, "max");

    return {
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

      return {
        message: error.message,
        success: false,
      };
    }

    return {
      message: "Unable to delete the product right now. Please try again.",
      success: false,
    };
  }
}
