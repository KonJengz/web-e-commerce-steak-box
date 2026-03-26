"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import {
  verifyEmailSubmissionSchema,
  type VerifyEmailSubmissionInput,
} from "@/features/auth/schemas/auth.schema";
import {
  clearPendingPostAuthRedirect,
  clearPendingVerificationEmail,
  getPendingPostAuthRedirect,
  getPendingVerificationEmail,
  persistAuthSession,
} from "@/features/auth/services/auth-session.service";
import { authService } from "@/features/auth/services/auth.service";
import type { VerifyEmailActionState } from "@/features/auth/types/auth.type";
import { ApiError } from "@/lib/api/error";

export async function verifyEmailAction(
  input: VerifyEmailSubmissionInput,
): Promise<VerifyEmailActionState> {
  const validatedInput = verifyEmailSubmissionSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    const pendingVerificationEmail = await getPendingVerificationEmail();
    const pendingRedirectTo = await getPendingPostAuthRedirect();

    if (!pendingVerificationEmail) {
      await clearPendingPostAuthRedirect();

      return {
        message:
          "Your verification session is no longer available. Please start again.",
        redirectTo: "/register",
        success: false,
      };
    }

    const result = await authService.verifyEmail({
      code: validatedInput.data.code,
      email: pendingVerificationEmail,
    });
    await persistAuthSession(result);

    return {
      redirectTo: pendingRedirectTo ?? "/",
      success: true,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof ApiError) {
      if (
        error.status === 400 &&
        error.message === "No pending verification found for this email"
      ) {
        await clearPendingPostAuthRedirect();
        await clearPendingVerificationEmail();

        return {
          message:
            "Your verification session is no longer available. Redirecting you to registration...",
          redirectTo: "/register",
          success: false,
        };
      }

      if (error.status === 400 && error.message === "Email already verified") {
        await clearPendingPostAuthRedirect();
        await clearPendingVerificationEmail();

        return {
          message:
            "This verification step is no longer needed. Redirecting you to login...",
          redirectTo: "/login",
          success: false,
        };
      }

      if (
        error.status === 400 &&
        error.message === "Verification code has expired"
      ) {
        return {
          message: "This OTP has expired. Request a new OTP to continue.",
          success: false,
        };
      }

      if (error.status === 429) {
        return {
          message:
            "Too many OTP attempts. Please request a new OTP to continue.",
          success: false,
        };
      }

      return {
        message: error.message,
        success: false,
      };
    }

    return {
      message: "Verification failed. Please check your code and try again.",
      success: false,
    };
  }
}
