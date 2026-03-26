"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import {
  loginSchema,
  type LoginInput,
} from "@/features/auth/schemas/auth.schema";
import {
  clearPendingVerificationEmail,
  persistAuthSession,
  persistPendingVerificationEmail,
} from "@/features/auth/services/auth-session.service";
import { authService } from "@/features/auth/services/auth.service";
import type { LoginActionState } from "@/features/auth/types/auth.type";
import { ApiError } from "@/lib/api/error";

export async function loginAction(
  input: LoginInput,
): Promise<LoginActionState> {
  const validatedInput = loginSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    const result = await authService.login(validatedInput.data);
    await persistAuthSession(result);

    return {
      redirectTo: "/",
      success: true,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof ApiError) {
      if (error.status === 403 && error.message === "Email not verified") {
        await persistPendingVerificationEmail(validatedInput.data.email);

        return {
          message:
            "Email and password are correct, but this account is not verified yet. Enter the OTP we sent to finish signing in.",
          requiresEmailVerification: true,
          success: false,
        };
      }

      await clearPendingVerificationEmail();

      return {
        message: error.message,
        success: false,
      };
    }

    return {
      message: "Unable to sign in right now. Please try again.",
      success: false,
    };
  }
}
