"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import { clearAuthSession } from "@/features/auth/services/auth-session.service";
import { getCurrentAccessToken } from "@/features/auth/services/current-user.service";
import {
  updatePasswordSchema,
  type ChangePasswordInput,
  type SetPasswordInput,
  type UpdatePasswordInput,
} from "@/features/user/schemas/profile.schema";
import { userService } from "@/features/user/services/user.service";
import type { UpdatePasswordActionState } from "@/features/user/types/user.type";
import { ApiError } from "@/lib/api/error";

const buildUnauthorizedState = async (): Promise<UpdatePasswordActionState> => {
  return {
    message: "Your session expired. Please sign in again to update your password.",
    redirectToLogin: true,
    requiresReauthentication: true,
    success: false,
  };
};

const buildApiErrorState = (error: ApiError): UpdatePasswordActionState => {
  if (error.message === "Current password is incorrect") {
    return {
      fieldErrors: {
        currentPassword: [error.message],
      },
      message: error.message,
      success: false,
    };
  }

  if (error.message === "New password must be different from the current password") {
    return {
      fieldErrors: {
        newPassword: [error.message],
      },
      message: error.message,
      success: false,
    };
  }

  if (error.message === "Password is not set for this account. Use set password instead.") {
    return {
      fieldErrors: {
        currentPassword: [
          "This account does not have a password yet. Leave current password blank and save again.",
        ],
      },
      message:
        "This account does not have a password yet. Leave current password blank and save again.",
      success: false,
    };
  }

  if (error.message === "Password is already set for this account. Use change password instead.") {
    return {
      fieldErrors: {
        currentPassword: [
          "This account already has a password. Enter your current password to change it.",
        ],
      },
      message:
        "This account already has a password. Enter your current password to change it.",
      success: false,
    };
  }

  return {
    message: error.message,
    success: false,
  };
};

export async function updatePasswordAction(
  input: UpdatePasswordInput,
): Promise<UpdatePasswordActionState> {
  const accessToken = await getCurrentAccessToken();

  if (!accessToken) {
    return buildUnauthorizedState();
  }

  const validatedInput = updatePasswordSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  const currentPassword = validatedInput.data.currentPassword;

  try {
    if (currentPassword.length > 0) {
      const changePasswordInput: ChangePasswordInput = {
        currentPassword,
        newPassword: validatedInput.data.newPassword,
      };

      await userService.changePassword(accessToken, changePasswordInput);
    } else {
      const setPasswordInput: SetPasswordInput = {
        newPassword: validatedInput.data.newPassword,
      };

      await userService.setPassword(accessToken, setPasswordInput);
    }

    await clearAuthSession();

    return {
      message: "Password updated. Please sign in again.",
      redirectToLogin: true,
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

      return buildApiErrorState(error);
    }

    return {
      message: "Unable to update your password right now. Please try again.",
      success: false,
    };
  }
}
