"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import { clearAuthSession } from "@/features/auth/services/auth-session.service";
import { getCurrentAccessToken } from "@/features/auth/services/current-user.service";
import {
  createCategorySchema,
  type CreateCategoryInput,
} from "@/features/category/schemas/category.schema";
import { categoryService } from "@/features/category/services/category.service";
import type { CreateCategoryActionState } from "@/features/category/types/category.type";
import { ApiError } from "@/lib/api/error";

const buildUnauthorizedState = async (): Promise<CreateCategoryActionState> => {
  await clearAuthSession();

  return {
    message: "Your session expired. Please sign in again to manage categories.",
    requiresReauthentication: true,
    success: false,
  };
};

const buildApiErrorState = (error: ApiError): CreateCategoryActionState => {
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

export async function createCategoryAction(
  input: CreateCategoryInput,
): Promise<CreateCategoryActionState> {
  const accessToken = await getCurrentAccessToken();

  if (!accessToken) {
    return buildUnauthorizedState();
  }

  const validatedInput = createCategorySchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    await categoryService.create(accessToken, validatedInput.data);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");

    return {
      message: "Category created successfully.",
      success: true,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof ApiError) {
      if (error.status === 401) {
        return buildUnauthorizedState();
      }

      return buildApiErrorState(error);
    }

    return {
      message: "Unable to create the category right now. Please try again.",
      success: false,
    };
  }
}
