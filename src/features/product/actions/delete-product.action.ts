"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import {
  executeWithServerAuthRetry,
  isServerAuthRequiredError,
} from "@/features/auth/services/server-auth-execution.service";
import { productService } from "@/features/product/services/product.service";
import type { DeleteProductActionState } from "@/features/product/types/product.type";
import { ApiError } from "@/lib/api/error";

const buildUnauthorizedState = async (): Promise<DeleteProductActionState> => {
  return {
    message: "Your session expired. Please sign in again to manage products.",
    requiresReauthentication: true,
    success: false,
  };
};

export async function deleteProductAction(
  productId: string,
): Promise<DeleteProductActionState> {
  try {
    await executeWithServerAuthRetry((accessToken) =>
      productService.remove(accessToken, productId),
    );

    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");

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

    if (error instanceof ApiError) {
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
