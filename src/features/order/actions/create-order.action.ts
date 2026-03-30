"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import { cartService } from "@/features/cart/services/cart.service";
import {
  executeWithServerAuthRetry,
  isServerAuthRequiredError,
} from "@/features/auth/services/server-auth-execution.service";
import {
  checkoutOrderFormSchema,
  type CheckoutOrderFormInput,
} from "@/features/order/schemas/order.schema";
import { orderService } from "@/features/order/services/order.service";
import type { CreateOrderActionState } from "@/features/order/types/order.type";
import { buildAccountOrderPath } from "@/features/order/utils/order-path";
import { PUBLIC_PRODUCTS_CACHE_TAG } from "@/lib/cache-tags";
import { ApiError } from "@/lib/api/error";

const buildUnauthorizedState = (): CreateOrderActionState => {
  return {
    message: "Your session expired. Please sign in again to place this order.",
    requiresReauthentication: true,
    success: false,
  };
};

const buildApiErrorState = (error: ApiError): CreateOrderActionState => {
  if (error.message === "Shipping address not found") {
    return {
      fieldErrors: {
        shippingAddressId: ["Choose one of your saved delivery addresses."],
      },
      message: "Choose one of your saved delivery addresses.",
      success: false,
    };
  }

  if (error.message === "Cart is empty") {
    return {
      message: "Your cart is empty. Add products before placing an order.",
      success: false,
    };
  }

  if (
    error.message === "Requested quantity exceeds available stock" ||
    error.message === "Product not found or inactive"
  ) {
    return {
      message:
        "One or more cart items changed while you were preparing checkout. Review the cart and try again.",
      success: false,
    };
  }

  return {
    message: error.message,
    success: false,
  };
};

export async function createOrderAction(
  input: CheckoutOrderFormInput,
): Promise<CreateOrderActionState> {
  const validatedInput = checkoutOrderFormSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    const createdOrder = await executeWithServerAuthRetry(async (accessToken) => {
      const cart = await cartService.getCurrent(accessToken);

      return orderService.create(accessToken, {
        items: cart.data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddressId: validatedInput.data.shippingAddressId,
      });
    });

    const redirectTo = `${buildAccountOrderPath(createdOrder.data.id)}?step=payment`;

    revalidatePath("/cart");
    revalidatePath("/checkout");
    revalidatePath("/orders");
    revalidatePath(buildAccountOrderPath(createdOrder.data.id));
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
    revalidateTag(PUBLIC_PRODUCTS_CACHE_TAG, "max");

    return {
      message: "Order created. Upload the payment slip to move it into review.",
      order: createdOrder.data,
      redirectTo,
      success: true,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (isServerAuthRequiredError(error)) {
      return buildUnauthorizedState();
    }

    if (error instanceof ApiError) {
      return buildApiErrorState(error);
    }

    return {
      message: "Unable to create the order right now. Please try again.",
      success: false,
    };
  }
}
