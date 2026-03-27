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
  createProductSchema,
  type CreateProductInput,
} from "@/features/product/schemas/product.schema";
import { productService } from "@/features/product/services/product.service";
import type { CreateProductActionState } from "@/features/product/types/product.type";
import { ApiError } from "@/lib/api/error";

const buildUnauthorizedState = async (): Promise<CreateProductActionState> => {
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

  return {
    message: error.message,
    success: false,
  };
};

export async function createProductAction(
  input: CreateProductInput,
): Promise<CreateProductActionState> {
  const validatedInput = createProductSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    await executeWithAdminServerAuthRetry((accessToken) =>
      productService.create(accessToken, validatedInput.data),
    );

    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");

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
