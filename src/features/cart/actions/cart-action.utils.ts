"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import {
  executeWithServerAuthRetry,
  isServerAuthRequiredError,
} from "@/features/auth/services/server-auth-execution.service";
import type { Cart } from "@/features/cart/types/cart.type";
import { ApiError } from "@/lib/api/error";
import type { ApiResult } from "@/types";

export interface CartMutationActionState {
  cart?: Cart | null;
  message?: string;
  requiresLogin?: boolean;
  success: boolean;
}

export const runCartMutation = async (
  operation: (accessToken: string) => Promise<ApiResult<Cart | null>>,
  successMessage?: string,
): Promise<CartMutationActionState> => {
  try {
    const result = await executeWithServerAuthRetry(operation);

    revalidatePath("/cart");
    revalidatePath("/checkout");

    return {
      cart: result.data,
      message: successMessage,
      success: true,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (isServerAuthRequiredError(error)) {
      return {
        message: "Please sign in to manage your cart.",
        requiresLogin: true,
        success: false,
      };
    }

    if (error instanceof ApiError) {
      return {
        message: error.message,
        success: false,
      };
    }

    return {
      message: "Something went wrong. Please try again.",
      success: false,
    };
  }
};
