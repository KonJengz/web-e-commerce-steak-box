"use server";

import { refresh, revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import {
  executeWithServerAuthRetry,
  isServerAuthRequiredError,
} from "@/features/auth/services/server-auth-execution.service";
import {
  requestEmailChangeSchema,
  verifyEmailChangeSchema,
  type RequestEmailChangeInput,
  type VerifyEmailChangeInput,
} from "@/features/user/schemas/profile.schema";
import { userService } from "@/features/user/services/user.service";
import type {
  RequestEmailChangeActionState,
  VerifyEmailChangeActionState,
} from "@/features/user/types/user.type";
import { ApiError } from "@/lib/api/error";

const buildUnauthorizedRequestState =
  async (): Promise<RequestEmailChangeActionState> => {
    return {
      message: "Your session expired. Please sign in again to change your email.",
      requiresReauthentication: true,
      success: false,
    };
  };

const buildUnauthorizedVerifyState =
  async (): Promise<VerifyEmailChangeActionState> => {
    return {
      message: "Your session expired. Please sign in again to verify your email change.",
      requiresReauthentication: true,
      success: false,
    };
  };

const buildRequestEmailChangeErrorState = (
  error: ApiError,
): RequestEmailChangeActionState => {
  if (error.message.toLowerCase().includes("email")) {
    return {
      fieldErrors: {
        email: [error.message],
      },
      message: error.message,
      success: false,
    };
  }

  return {
    message: error.message,
    success: false,
  };
};

const buildVerifyEmailChangeErrorState = (
  error: ApiError,
): VerifyEmailChangeActionState => {
  const normalizedMessage = error.message.toLowerCase();

  if (
    normalizedMessage.includes("verification code") ||
    normalizedMessage.includes("otp") ||
    normalizedMessage.includes("code")
  ) {
    return {
      fieldErrors: {
        code: [error.message],
      },
      message: error.message,
      success: false,
    };
  }

  if (normalizedMessage.includes("email")) {
    return {
      fieldErrors: {
        email: [error.message],
      },
      message: error.message,
      success: false,
    };
  }

  return {
    message: error.message,
    success: false,
  };
};

export async function requestEmailChangeAction(
  input: RequestEmailChangeInput,
): Promise<RequestEmailChangeActionState> {
  const validatedInput = requestEmailChangeSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    const result = await executeWithServerAuthRetry((accessToken) =>
      userService.requestEmailChange(accessToken, validatedInput.data),
    );

    return {
      message: result.data.message,
      pendingEmail: validatedInput.data.email,
      success: true,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (isServerAuthRequiredError(error)) {
      return buildUnauthorizedRequestState();
    }

    if (error instanceof ApiError) {
      return buildRequestEmailChangeErrorState(error);
    }

    return {
      message: "Unable to start the email change right now. Please try again.",
      success: false,
    };
  }
}

export async function verifyEmailChangeAction(
  input: VerifyEmailChangeInput,
): Promise<VerifyEmailChangeActionState> {
  const validatedInput = verifyEmailChangeSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    const result = await executeWithServerAuthRetry((accessToken) =>
      userService.verifyEmailChange(accessToken, validatedInput.data),
    );

    revalidatePath("/(main)", "layout");
    refresh();

    return {
      message: "Email updated successfully.",
      profile: result.data,
      success: true,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (isServerAuthRequiredError(error)) {
      return buildUnauthorizedVerifyState();
    }

    if (error instanceof ApiError) {
      return buildVerifyEmailChangeErrorState(error);
    }

    return {
      message: "Unable to verify the email change right now. Please try again.",
      success: false,
    };
  }
}
