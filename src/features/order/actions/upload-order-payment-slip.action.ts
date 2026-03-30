"use server";

import { refresh, revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import {
  executeWithServerAuthRetry,
  isServerAuthRequiredError,
} from "@/features/auth/services/server-auth-execution.service";
import { orderPaymentSlipSchema } from "@/features/order/schemas/order.schema";
import { orderService } from "@/features/order/services/order.service";
import type { UploadOrderPaymentSlipActionState } from "@/features/order/types/order.type";
import { buildAccountOrderPath } from "@/features/order/utils/order-path";
import { ApiError } from "@/lib/api/error";

const getOrderPaymentSlipInput = (formData: FormData): unknown => {
  const slip = formData.get("slip");

  return {
    slip: slip instanceof File ? slip : undefined,
  };
};

const buildUnauthorizedState = (): UploadOrderPaymentSlipActionState => {
  return {
    message: "Your session expired. Please sign in again to upload the slip.",
    requiresReauthentication: true,
    success: false,
  };
};

const buildApiErrorState = (
  error: ApiError,
): UploadOrderPaymentSlipActionState => {
  if (error.message.startsWith("Unsupported image type")) {
    return {
      fieldErrors: {
        slip: ["Please choose JPG, PNG, or WEBP images only."],
      },
      message: "Please choose JPG, PNG, or WEBP images only.",
      success: false,
    };
  }

  if (error.message.startsWith("Image is too large")) {
    return {
      fieldErrors: {
        slip: ["Payment slip must be 5 MB or smaller."],
      },
      message: "Payment slip must be 5 MB or smaller.",
      success: false,
    };
  }

  if (error.message.includes("Payment slip can only be updated")) {
    return {
      message:
        "This order is already approved or closed, so the payment slip cannot be changed anymore.",
      success: false,
    };
  }

  return {
    message: error.message,
    success: false,
  };
};

export async function uploadOrderPaymentSlipAction(
  orderId: string,
  formData: FormData,
): Promise<UploadOrderPaymentSlipActionState> {
  const validatedInput = orderPaymentSlipSchema.safeParse(
    getOrderPaymentSlipInput(formData),
  );

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    const updatedOrder = await executeWithServerAuthRetry((accessToken) =>
      orderService.uploadPaymentSlip(accessToken, orderId, validatedInput.data),
    );

    revalidatePath("/orders");
    revalidatePath("/checkout");
    revalidatePath(buildAccountOrderPath(orderId));
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
    refresh();

    return {
      message: "Payment slip uploaded. The order is now waiting for admin review.",
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

    if (error instanceof ApiError) {
      return buildApiErrorState(error);
    }

    return {
      message: "Unable to upload the payment slip right now. Please try again.",
      success: false,
    };
  }
}
