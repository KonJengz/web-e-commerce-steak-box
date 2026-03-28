"use server";

import {
  runCartMutation,
  type CartMutationActionState,
} from "@/features/cart/actions/cart-action.utils";
import {
  removeCartItemSchema,
  type RemoveCartItemInput,
} from "@/features/cart/schemas/cart.schema";
import { cartService } from "@/features/cart/services/cart.service";

export async function removeCartItemAction(
  input: RemoveCartItemInput,
): Promise<CartMutationActionState> {
  const validated = removeCartItemSchema.safeParse(input);

  if (!validated.success) {
    return {
      message: "Invalid cart item. Please try again.",
      success: false,
    };
  }

  return runCartMutation(async (accessToken) => {
    return cartService.removeItem(accessToken, validated.data.productId);
  });
}
