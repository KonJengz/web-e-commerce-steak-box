import "server-only";

import { cookies } from "next/headers";

import { envServer } from "@/config/env.server";
import type { AuthResponse } from "@/features/auth/types/auth.type";
import { getCookieValueFromSetCookieHeaders } from "@/lib/auth-helpers";
import type { ApiResult } from "@/types";

const isProduction = process.env.NODE_ENV === "production";

export const persistAuthSession = async (
  result: ApiResult<AuthResponse>,
): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.set({
    httpOnly: true,
    maxAge: envServer.ACCESS_TOKEN_MAX_AGE,
    name: envServer.ACCESS_TOKEN_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: result.data.accessToken,
  });

  const refreshTokenValue = getCookieValueFromSetCookieHeaders(
    result.headers,
    envServer.REFRESH_TOKEN_COOKIE_NAME,
  );

  if (!refreshTokenValue) {
    return;
  }

  cookieStore.set({
    httpOnly: true,
    maxAge: envServer.REFRESH_TOKEN_MAX_AGE,
    name: envServer.REFRESH_TOKEN_COOKIE_NAME,
    path: "/",
    sameSite: "strict",
    secure: isProduction,
    value: refreshTokenValue,
  });
};

export const clearAuthSession = async (): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.set({
    httpOnly: true,
    maxAge: 0,
    name: envServer.ACCESS_TOKEN_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: "",
  });

  cookieStore.set({
    httpOnly: true,
    maxAge: 0,
    name: envServer.REFRESH_TOKEN_COOKIE_NAME,
    path: "/",
    sameSite: "strict",
    secure: isProduction,
    value: "",
  });
};
