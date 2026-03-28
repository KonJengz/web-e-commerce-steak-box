"use server";

import {
  runCartMutation,
  type CartMutationActionState,
} from "@/features/cart/actions/cart-action.utils";
import {
  type UpdateCartItemInput,
  updateCartItemSchema,
} from "@/features/cart/schemas/cart.schema";
import { cartService } from "@/features/cart/services/cart.service";

export async function updateCartItemAction(
  input: UpdateCartItemInput,
): Promise<CartMutationActionState> {
  const validated = updateCartItemSchema.safeParse(input);

  if (!validated.success) {
    return {
      message: "Invalid cart update. Please try again.",
      success: false,
    };
  }

  return runCartMutation(async (accessToken) => {
    return cartService.updateItem(
      accessToken,
      validated.data.productId,
      validated.data.quantity,
    );
  });
}
