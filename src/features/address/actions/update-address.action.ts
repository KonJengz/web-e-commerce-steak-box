"use server";

import { refresh, revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import {
  updateAddressSchema,
  type UpdateAddressInput,
} from "@/features/address/schemas/address.schema";
import { addressService } from "@/features/address/services/address.service";
import type { UpdateAddressActionState } from "@/features/address/types/address.type";
import {
  executeWithServerAuthRetry,
  isServerAuthRequiredError,
} from "@/features/auth/services/server-auth-execution.service";
import { ApiError } from "@/lib/api/error";

const buildUnauthorizedState = async (): Promise<UpdateAddressActionState> => {
  return {
    message: "Your session expired. Please sign in again to update this address.",
    requiresReauthentication: true,
    success: false,
  };
};

export async function updateAddressAction(
  addressId: string,
  input: UpdateAddressInput,
): Promise<UpdateAddressActionState> {
  const normalizedAddressId = addressId.trim();

  if (!normalizedAddressId) {
    return {
      message: "Address could not be identified. Refresh the page and try again.",
      success: false,
    };
  }

  const validatedInput = updateAddressSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    await executeWithServerAuthRetry((accessToken) =>
      addressService.update(accessToken, normalizedAddressId, validatedInput.data),
    );

    revalidatePath("/addresses");
    revalidatePath("/checkout");
    refresh();

    return {
      message: "Address updated successfully.",
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
      return {
        message: error.message,
        success: false,
      };
    }

    return {
      message: "Unable to update the address right now. Please try again.",
      success: false,
    };
  }
}
