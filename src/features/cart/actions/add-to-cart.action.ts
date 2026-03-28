"use server";

import {
  addToCartSchema,
  type AddToCartInput,
} from "@/features/cart/schemas/cart.schema";
import { cartService } from "@/features/cart/services/cart.service";
import {
  runCartMutation,
  type CartMutationActionState,
} from "@/features/cart/actions/cart-action.utils";

export async function addToCartAction(
  input: AddToCartInput,
): Promise<CartMutationActionState> {
  const validated = addToCartSchema.safeParse(input);

  if (!validated.success) {
    return {
      message: "Invalid input. Please try again.",
      success: false,
    };
  }

  return runCartMutation(
    async (accessToken) => {
      return cartService.addItem(
        accessToken,
        validated.data.productId,
        validated.data.quantity,
      );
    },
    "Added to cart!",
  );
}
