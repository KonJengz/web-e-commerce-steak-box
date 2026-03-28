import { envServer } from "@/config/env.server";

export const BACKEND_REFRESH_TOKEN_COOKIE_NAME =
  envServer.REFRESH_TOKEN_COOKIE_NAME;
export const APP_REFRESH_TOKEN_COOKIE_NAME = BACKEND_REFRESH_TOKEN_COOKIE_NAME;
export const BACKEND_REFRESH_TOKEN_COOKIE_PATH = "/";
export const LEGACY_BACKEND_REFRESH_TOKEN_COOKIE_PATH = "/api/auth";

type AuthCookieSameSite = "lax" | "strict";

export interface AuthCookieWriter {
  set: (options: {
    httpOnly: true;
    maxAge: number;
    name: string;
    path: string;
    sameSite: AuthCookieSameSite;
    secure: boolean;
    value: string;
  }) => unknown;
}

export interface AuthCookieReader {
  get: (name: string) => { value: string } | undefined;
}

const isProduction = process.env.NODE_ENV === "production";

const buildCookie = (
  name: string,
  value: string,
  maxAge: number,
  sameSite: AuthCookieSameSite,
  path = "/",
) => {
  return {
    httpOnly: true as const,
    maxAge,
    name,
    path,
    sameSite,
    secure: isProduction,
    value,
  };
};

export const normalizeCookieValue = (
  cookieValue: string | null | undefined,
): string | null => {
  return cookieValue && cookieValue.length > 0 ? cookieValue : null;
};

export const getStoredRefreshTokenValue = (
  cookieStore: AuthCookieReader,
): string | null => {
  return normalizeCookieValue(
    cookieStore.get(BACKEND_REFRESH_TOKEN_COOKIE_NAME)?.value,
  );
};

export const buildAccessTokenCookie = (accessToken: string) => {
  return buildCookie(
    envServer.ACCESS_TOKEN_COOKIE_NAME,
    accessToken,
    envServer.ACCESS_TOKEN_MAX_AGE,
    "lax",
  );
};

export const buildClearedAccessTokenCookie = () => {
  return buildCookie(envServer.ACCESS_TOKEN_COOKIE_NAME, "", 0, "lax");
};

export const buildAppRefreshTokenCookie = (
  refreshToken: string,
  path = "/",
) => {
  return buildCookie(
    APP_REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    envServer.REFRESH_TOKEN_MAX_AGE,
    "strict",
    path,
  );
};

export const buildClearedAppRefreshTokenCookie = (path = "/") => {
  return buildCookie(APP_REFRESH_TOKEN_COOKIE_NAME, "", 0, "strict", path);
};

export const buildClearedBackendRefreshTokenCookie = (
  path = BACKEND_REFRESH_TOKEN_COOKIE_PATH,
) => {
  return buildCookie(BACKEND_REFRESH_TOKEN_COOKIE_NAME, "", 0, "strict", path);
};

export const buildExpiredCookieHeader = (name: string, path: string): string => {
  const cookieParts = [
    `${name}=`,
    `Path=${path}`,
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Strict",
  ];

  if (isProduction) {
    cookieParts.push("Secure");
  }

  return cookieParts.join("; ");
};

export const logAuthDebug = (
  event: string,
  details: Record<string, unknown>,
): void => {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.info("[auth-debug]", event, details);
};
