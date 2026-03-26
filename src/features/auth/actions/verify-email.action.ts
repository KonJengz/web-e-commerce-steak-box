"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import {
  verifyEmailSchema,
  type VerifyEmailInput,
} from "@/features/auth/schemas/auth.schema";
import { persistAuthSession } from "@/features/auth/services/auth-session.service";
import { authService } from "@/features/auth/services/auth.service";
import type { VerifyEmailActionState } from "@/features/auth/types/auth.type";
import { ApiError } from "@/lib/api/error";

export async function verifyEmailAction(
  input: VerifyEmailInput,
): Promise<VerifyEmailActionState> {
  const validatedInput = verifyEmailSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    const result = await authService.verifyEmail(validatedInput.data);
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
