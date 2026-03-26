"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import {
  registerSchema,
  type RegisterInput,
} from "@/features/auth/schemas/auth.schema";
import { authService } from "@/features/auth/services/auth.service";
import type { RegisterActionState } from "@/features/auth/types/auth.type";
import { ApiError } from "@/lib/api/error";

export async function registerAction(
  input: RegisterInput,
): Promise<RegisterActionState> {
  const validatedInput = registerSchema.safeParse(input);

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

    return {
      redirectTo: `/verify-email?email=${encodeURIComponent(email)}`,
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
      message: "Something went wrong during registration. Please try again.",
      success: false,
    };
  }
}
