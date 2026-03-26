"use server";

import { cookies } from "next/headers";
import { isRedirectError } from "next/dist/client/components/redirect";

import { envServer } from "@/config/env.server";
import { loginSchema, type LoginInput } from "@/features/auth/schemas/auth.schema";
import { authService } from "@/features/auth/services/auth.service";
import type { LoginActionState } from "@/features/auth/types/auth.type";
import { ApiError } from "@/lib/api/error";

const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

const getRefreshTokenValue = (setCookieHeader: string | null): string | null => {
  if (!setCookieHeader) {
    return null;
  }

  const match = setCookieHeader.match(
    new RegExp(`(?:^|,\\s*)${REFRESH_TOKEN_COOKIE_NAME}=([^;]+)`),
  );

  return match?.[1] ? decodeURIComponent(match[1]) : null;
};

export async function loginAction(
  input: LoginInput,
): Promise<LoginActionState> {
  const validatedInput = loginSchema.safeParse(input);

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
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
    });

    const refreshTokenValue = getRefreshTokenValue(
      result.headers.get("set-cookie"),
    );

    if (refreshTokenValue) {
      cookieStore.set({
        httpOnly: true,
        name: REFRESH_TOKEN_COOKIE_NAME,
        path: "/api/auth",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        value: refreshTokenValue,
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
