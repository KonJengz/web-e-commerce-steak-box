"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/features/auth/schemas/auth.schema";
import {
  persistPendingPasswordResetEmail,
} from "@/features/auth/services/auth-session.service";
import { authService } from "@/features/auth/services/auth.service";
import type { ForgotPasswordActionState } from "@/features/auth/types/auth.type";
import { ApiError } from "@/lib/api/error";

const PASSWORD_RESET_COOLDOWN_SECONDS = 60;

export async function forgotPasswordAction(
  input: ForgotPasswordInput,
): Promise<ForgotPasswordActionState> {
  const validatedInput = forgotPasswordSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    const result = await authService.forgotPassword(validatedInput.data);

    await persistPendingPasswordResetEmail(validatedInput.data.email);

    return {
      cooldownSeconds: PASSWORD_RESET_COOLDOWN_SECONDS,
      message: result.data.message,
      success: true,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof ApiError) {
      if (error.status === 429) {
        await persistPendingPasswordResetEmail(validatedInput.data.email);

        return {
          cooldownSeconds: PASSWORD_RESET_COOLDOWN_SECONDS,
          message: error.message,
          success: false,
        };
      }

      return {
        message: error.message,
        success: false,
      };
    }

    return {
      message: "Unable to request a reset code right now. Please try again.",
      success: false,
    };
  }
}
