"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import {
  createAddressSchema,
  type CreateAddressInput,
} from "@/features/address/schemas/address.schema";
import { addressService } from "@/features/address/services/address.service";
import type { CreateAddressActionState } from "@/features/address/types/address.type";
import {
  executeWithServerAuthRetry,
  isServerAuthRequiredError,
} from "@/features/auth/services/server-auth-execution.service";
import { ApiError } from "@/lib/api/error";

const buildUnauthorizedState = async (): Promise<CreateAddressActionState> => {
  return {
    message: "Your session expired. Please sign in again to save an address.",
    requiresReauthentication: true,
    success: false,
  };
};

export async function createAddressAction(
  input: CreateAddressInput,
): Promise<CreateAddressActionState> {
  const validatedInput = createAddressSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    await executeWithServerAuthRetry((accessToken) =>
      addressService.create(accessToken, validatedInput.data),
    );

    revalidatePath("/addresses");
    revalidatePath("/checkout");

    return {
      message: "Address saved successfully.",
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
      message: "Unable to save the address right now. Please try again.",
      success: false,
    };
  }
}
