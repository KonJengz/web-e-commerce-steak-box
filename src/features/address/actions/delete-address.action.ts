"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { addressService } from "@/features/address/services/address.service";
import type { DeleteAddressActionState } from "@/features/address/types/address.type";
import { getCurrentAccessToken } from "@/features/auth/services/current-user.service";
import { ApiError } from "@/lib/api/error";

const buildUnauthorizedState = async (): Promise<DeleteAddressActionState> => {
  return {
    message: "Your session expired. Please sign in again to delete this address.",
    requiresReauthentication: true,
    success: false,
  };
};

export async function deleteAddressAction(
  addressId: string,
): Promise<DeleteAddressActionState> {
  const accessToken = await getCurrentAccessToken();

  if (!accessToken) {
    return buildUnauthorizedState();
  }

  const normalizedAddressId = addressId.trim();

  if (!normalizedAddressId) {
    return {
      message: "Address could not be identified. Refresh the page and try again.",
      success: false,
    };
  }

  try {
    const result = await addressService.remove(accessToken, normalizedAddressId);

    revalidatePath("/addresses");
    revalidatePath("/checkout");

    return {
      message: result.data.message ?? "Address deleted successfully.",
      success: true,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof ApiError) {
      if (error.status === 401) {
        return buildUnauthorizedState();
      }

      return {
        message: error.message,
        success: false,
      };
    }

    return {
      message: "Unable to delete the address right now. Please try again.",
      success: false,
    };
  }
}
