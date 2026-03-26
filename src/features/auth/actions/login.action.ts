"use server";

import { cookies } from "next/headers";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import { envServer } from "@/config/env.server";
import {
  loginSchema,
  type LoginInput,
} from "@/features/auth/schemas/auth.schema";
import { authService } from "@/features/auth/services/auth.service";
import type { LoginActionState } from "@/features/auth/types/auth.type";
import { getCookieValueFromSetCookieHeaders } from "@/lib/auth-helpers";
import { ApiError } from "@/lib/api/error";
import {
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/features/auth/constants/auth.constants";

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
    const cookieStore = await cookies();

    cookieStore.set({
      httpOnly: true,
      name: envServer.ACCESS_TOKEN_COOKIE_NAME,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      value: result.data.accessToken,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    const refreshTokenValue = getCookieValueFromSetCookieHeaders(
      result.headers,
      envServer.REFRESH_TOKEN_COOKIE_NAME,
    );
    if (refreshTokenValue) {
      cookieStore.set({
        httpOnly: true,
        name: envServer.REFRESH_TOKEN_COOKIE_NAME,
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        value: refreshTokenValue,
        maxAge: REFRESH_TOKEN_MAX_AGE,
      });
    }

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
      message: "Unable to sign in right now. Please try again.",
      success: false,
    };
  }
}
