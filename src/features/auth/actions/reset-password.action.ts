"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import {
  resetPasswordSchema,
  resetPasswordSubmissionSchema,
  type ResetPasswordSubmissionInput,
} from "@/features/auth/schemas/auth.schema";
import {
  clearAuthSession,
  clearPendingPasswordResetEmail,
  getPendingPasswordResetEmail,
} from "@/features/auth/services/auth-session.service";
import { authService } from "@/features/auth/services/auth.service";
import type { ResetPasswordActionState } from "@/features/auth/types/auth.type";
import { ApiError } from "@/lib/api/error";

export async function resetPasswordAction(
  input: ResetPasswordSubmissionInput,
): Promise<ResetPasswordActionState> {
  const pendingPasswordResetEmail = await getPendingPasswordResetEmail();

  if (!pendingPasswordResetEmail) {
    return {
      message: "This password reset step is no longer available. Request a new code and try again.",
      redirectTo: "/forgot-password",
      success: false,
    };
  }

  const validatedSubmission = resetPasswordSubmissionSchema.safeParse(input);

  if (!validatedSubmission.success) {
    return {
      fieldErrors: validatedSubmission.error.flatten().fieldErrors,
      message: z.prettifyError(validatedSubmission.error),
      success: false,
    };
  }

  const validatedInput = resetPasswordSchema.safeParse({
    ...validatedSubmission.data,
    email: pendingPasswordResetEmail,
  });

  if (!validatedInput.success) {
    return {
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    const result = await authService.resetPassword(validatedInput.data);

    await clearAuthSession();
    await clearPendingPasswordResetEmail();

    return {
      message: result.data.message,
      redirectTo: "/login",
      success: true,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof ApiError) {
      if (
        error.message === "No pending verification found for this email" ||
        error.message === "Verification code has expired"
      ) {
        await clearPendingPasswordResetEmail();

        return {
          fieldErrors: {
            code: [error.message],
          },
          message: error.message,
          redirectTo: "/forgot-password",
          success: false,
        };
      }

      if (error.message === "Invalid verification code") {
        return {
          fieldErrors: {
            code: [error.message],
          },
          message: error.message,
          success: false,
        };
      }

      if (error.status === 429) {
        return {
          fieldErrors: {
            code: [error.message],
          },
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
      message: "Unable to reset the password right now. Please try again.",
      success: false,
    };
  }
}
