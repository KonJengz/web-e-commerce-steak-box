"use server";

import { refresh, revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import {
  executeWithAdminServerAuthRetry,
  isServerAdminAuthorizationRequiredError,
  isServerAuthRequiredError,
} from "@/features/auth/services/server-auth-execution.service";
import {
  updateAdminOrderSchema,
  type UpdateAdminOrderInput,
} from "@/features/order/schemas/order.schema";
import { orderService } from "@/features/order/services/order.service";
import type { UpdateAdminOrderActionState } from "@/features/order/types/order.type";
import { ApiError } from "@/lib/api/error";

const buildUnauthorizedState = (): UpdateAdminOrderActionState => {
  return {
    message: "Your session expired. Please sign in again to manage orders.",
    requiresReauthentication: true,
    success: false,
  };
};

const buildForbiddenState = (): UpdateAdminOrderActionState => {
  return {
    message: "Administrator access is required to manage orders.",
    requiresAdmin: true,
    success: false,
  };
};

const buildApiErrorState = (error: ApiError): UpdateAdminOrderActionState => {
  if (error.message.includes("Cannot change order status")) {
    return {
      fieldErrors: {
        status: [error.message],
      },
      message: error.message,
      success: false,
    };
  }

  if (error.message.includes("Tracking number is required")) {
    return {
      fieldErrors: {
        trackingNumber: [error.message],
      },
      message: error.message,
      success: false,
    };
  }

  if (
    error.message.includes("Tracking number can only be set") ||
    error.message.includes("Tracking number cannot be blank") ||
    error.message.includes("Tracking number must be at most 100 characters")
  ) {
    return {
      fieldErrors: {
        trackingNumber: [error.message],
      },
      message: error.message,
      success: false,
    };
  }

  if (error.message.includes("Invalid order status")) {
    return {
      fieldErrors: {
        status: [error.message],
      },
      message: error.message,
      success: false,
    };
  }

  return {
    message: error.message,
    success: false,
  };
};

export async function updateAdminOrderAction(
  orderId: string,
  input: UpdateAdminOrderInput,
): Promise<UpdateAdminOrderActionState> {
  const validatedInput = updateAdminOrderSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    const updatedOrder = await executeWithAdminServerAuthRetry((accessToken) =>
      orderService.updateAdmin(accessToken, orderId, validatedInput.data),
    );

    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
    revalidatePath("/orders");
    refresh();

    return {
      message: "Order updated successfully.",
      order: updatedOrder.data,
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
      message: "Unable to update the order right now. Please try again.",
      success: false,
    };
  }
}
