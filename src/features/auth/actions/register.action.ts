"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import {
  registerSchema,
  type RegisterInput,
} from "@/features/auth/schemas/auth.schema";
import {
  clearPendingPostAuthRedirect,
  clearPendingVerificationEmail,
  normalizePostAuthRedirect,
  persistPendingPostAuthRedirect,
  persistPendingVerificationEmail,
} from "@/features/auth/services/auth-session.service";
import { authService } from "@/features/auth/services/auth.service";
import type { RegisterActionState } from "@/features/auth/types/auth.type";
import { ApiError } from "@/lib/api/error";

export async function registerAction(
  input: RegisterInput,
  redirectTo?: string | null,
): Promise<RegisterActionState> {
  const validatedInput = registerSchema.safeParse(input);
  const normalizedRedirectTo = normalizePostAuthRedirect(redirectTo);

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    const { email, name, password } = validatedInput.data;
    await authService.register({ email, name, password });
    await persistPendingVerificationEmail(email);

    if (normalizedRedirectTo) {
      await persistPendingPostAuthRedirect(normalizedRedirectTo);
    } else {
      await clearPendingPostAuthRedirect();
    }

    return {
      redirectTo: "/verify-email",
      success: true,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof ApiError) {
      if (error.status === 409 && error.message === "Email already registered") {
        await clearPendingPostAuthRedirect();
        await clearPendingVerificationEmail();

        return {
          message:
            "This signup could not be completed. If you already have an account, sign in instead.",
          success: false,
        };
      }

      await clearPendingPostAuthRedirect();
      await clearPendingVerificationEmail();

      return {
        message: error.message,
        success: false,
      };
    }

    await clearPendingPostAuthRedirect();
    await clearPendingVerificationEmail();

    return {
      message: "Something went wrong during registration. Please try again.",
      success: false,
    };
  }
}
