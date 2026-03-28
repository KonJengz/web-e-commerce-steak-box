"use server";

import {
  runCartMutation,
  type CartMutationActionState,
} from "@/features/cart/actions/cart-action.utils";
import { cartService } from "@/features/cart/services/cart.service";

export async function clearCartAction(): Promise<CartMutationActionState> {
  return runCartMutation(async (accessToken) => {
    return cartService.clear(accessToken);
  });
}
