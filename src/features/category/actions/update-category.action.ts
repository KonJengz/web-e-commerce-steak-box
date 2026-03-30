"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import {
  executeWithAdminServerAuthRetry,
  isServerAdminAuthorizationRequiredError,
  isServerAuthRequiredError,
} from "@/features/auth/services/server-auth-execution.service";
import {
  updateCategorySchema,
  type UpdateCategoryInput,
} from "@/features/category/schemas/category.schema";
import { categoryService } from "@/features/category/services/category.service";
import type { UpdateCategoryActionState } from "@/features/category/types/category.type";
import { buildCategoryPath } from "@/features/category/utils/category-path";
import { ApiError } from "@/lib/api/error";

const buildUnauthorizedState = async (): Promise<UpdateCategoryActionState> => {
  return {
    message: "Your session expired. Please sign in again to update categories.",
    requiresReauthentication: true,
    success: false,
  };
};

const buildForbiddenState = (): UpdateCategoryActionState => {
  return {
    message: "Administrator access is required to update categories.",
    requiresAdmin: true,
    success: false,
  };
};

const buildApiErrorState = (error: ApiError): UpdateCategoryActionState => {
  if (error.message === "Category already exists") {
    return {
      fieldErrors: {
        name: ["A category with this name already exists."],
      },
      message: "A category with this name already exists.",
      success: false,
    };
  }

  return {
    message: error.message,
    success: false,
  };
};

export async function updateCategoryAction(
  categoryId: string,
  input: UpdateCategoryInput,
): Promise<UpdateCategoryActionState> {
  const normalizedCategoryId = categoryId.trim();

  if (!normalizedCategoryId) {
    return {
      message: "Category could not be identified. Refresh the page and try again.",
      success: false,
    };
  }

  const validatedInput = updateCategorySchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    const updatedCategory = await executeWithAdminServerAuthRetry((accessToken) =>
      categoryService.update(accessToken, normalizedCategoryId, validatedInput.data),
    );

    revalidatePath("/admin/categories");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/products");
    revalidatePath(buildCategoryPath(updatedCategory.data.slug));
    revalidatePath("/");

    return {
      message: "Category updated successfully.",
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
      message: "Unable to update the category right now. Please try again.",
      success: false,
    };
  }
}
