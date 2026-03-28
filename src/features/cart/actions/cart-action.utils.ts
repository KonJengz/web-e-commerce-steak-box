"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import {
  executeWithServerAuthRetry,
  isServerAuthRequiredError,
} from "@/features/auth/services/server-auth-execution.service";
import { ApiError } from "@/lib/api/error";

export interface CartMutationActionState {
  message?: string;
  requiresLogin?: boolean;
  success: boolean;
}

export const runCartMutation = async (
  operation: (accessToken: string) => Promise<unknown>,
  successMessage?: string,
): Promise<CartMutationActionState> => {
  try {
    await executeWithServerAuthRetry(operation);

    revalidatePath("/cart");
    revalidatePath("/checkout");

    return {
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
