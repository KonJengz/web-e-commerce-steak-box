"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";

import {
  clearPendingPostAuthRedirect,
  clearPendingVerificationEmail,
  getPendingVerificationEmail,
  persistPendingVerificationEmail,
} from "@/features/auth/services/auth-session.service";
import { authService } from "@/features/auth/services/auth.service";
import type { ResendVerificationActionState } from "@/features/auth/types/auth.type";
import { ApiError } from "@/lib/api/error";

export async function resendVerificationAction(): Promise<ResendVerificationActionState> {
  try {
    const pendingVerificationEmail = await getPendingVerificationEmail();

    if (!pendingVerificationEmail) {
      return {
        message:
          "Your verification session is no longer available. Please start again.",
        redirectTo: "/register",
        success: false,
      };
    }

    await authService.resendVerification({ email: pendingVerificationEmail });
    await persistPendingVerificationEmail(pendingVerificationEmail);

    return {
      cooldownSeconds: 60,
      message: "A new OTP has been sent. Please use the latest code only.",
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

      if (error.status === 429 || error.message.includes("Too many")) {
        return {
          cooldownSeconds: 60,
          message:
            "Too many OTP requests. You can tap Resend OTP again in 1 minute.",
          success: false,
        };
      }

      return {
        message: error.message,
        success: false,
      };
    }

    return {
      message: "Failed to resend verification code. Please try again.",
      success: false,
    };
  }
}
