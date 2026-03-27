"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { revalidatePath } from "next/cache";

import {
  addToCartSchema,
  type AddToCartInput,
} from "@/features/cart/schemas/cart.schema";
import { cartService } from "@/features/cart/services/cart.service";
import {
  executeWithServerAuthRetry,
  isServerAuthRequiredError,
} from "@/features/auth/services/server-auth-execution.service";
import { ApiError } from "@/lib/api/error";

export interface AddToCartActionState {
  message?: string;
  requiresLogin?: boolean;
  success: boolean;
}

export async function addToCartAction(
  input: AddToCartInput,
): Promise<AddToCartActionState> {
  const validated = addToCartSchema.safeParse(input);

  if (!validated.success) {
    return {
      message: "Invalid input. Please try again.",
      success: false,
    };
  }

  try {
    await executeWithServerAuthRetry(async (accessToken) => {
      return cartService.addItem(
        accessToken,
        validated.data.productId,
        validated.data.quantity,
      );
    });

    revalidatePath("/cart");

    return {
      message: "Added to cart!",
      success: true,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (isServerAuthRequiredError(error)) {
      return {
        message: "Please sign in to add items to your cart.",
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
}
