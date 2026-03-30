"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import {
  executeWithAdminServerAuthRetry,
  isServerAdminAuthorizationRequiredError,
  isServerAuthRequiredError,
} from "@/features/auth/services/server-auth-execution.service";
import { categoryService } from "@/features/category/services/category.service";
import type { DeleteCategoryActionState } from "@/features/category/types/category.type";
import {
  PUBLIC_CATEGORIES_CACHE_TAG,
  PUBLIC_PRODUCTS_CACHE_TAG,
} from "@/lib/cache-tags";
import { ApiError } from "@/lib/api/error";

const buildUnauthorizedState = async (): Promise<DeleteCategoryActionState> => {
  return {
    message: "Your session expired. Please sign in again to manage categories.",
    requiresReauthentication: true,
    success: false,
  };
};

const buildForbiddenState = (): DeleteCategoryActionState => {
  return {
    message: "Administrator access is required to manage categories.",
    requiresAdmin: true,
    success: false,
  };
};

const buildApiErrorState = (error: ApiError): DeleteCategoryActionState => {
  if (error.message === "Cannot delete category while products are assigned to it") {
    return {
      message:
        "This category is still assigned to products. Move those products first, then delete it.",
      success: false,
    };
  }

  return {
    message: error.message,
    success: false,
  };
};

export async function deleteCategoryAction(
  categoryId: string,
): Promise<DeleteCategoryActionState> {
  const normalizedCategoryId = categoryId.trim();

  if (!normalizedCategoryId) {
    return {
      message: "Category could not be identified. Refresh the page and try again.",
      success: false,
    };
  }

  try {
    await executeWithAdminServerAuthRetry((accessToken) =>
      categoryService.remove(accessToken, normalizedCategoryId),
    );

    revalidatePath("/admin/categories");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidateTag(PUBLIC_CATEGORIES_CACHE_TAG, "max");
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

      return buildApiErrorState(error);
    }

    return {
      message: "Unable to delete the category right now. Please try again.",
      success: false,
    };
  }
}
