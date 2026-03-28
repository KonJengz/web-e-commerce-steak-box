import "server-only";

import { cookies } from "next/headers";

import type { AuthResponse } from "@/features/auth/types/auth.type";
import {
  APP_REFRESH_TOKEN_COOKIE_NAME,
  BACKEND_REFRESH_TOKEN_COOKIE_NAME,
  LEGACY_BACKEND_REFRESH_TOKEN_COOKIE_PATH,
  buildAccessTokenCookie,
  buildAppRefreshTokenCookie,
  buildClearedAccessTokenCookie,
  buildClearedAppRefreshTokenCookie,
  buildClearedBackendRefreshTokenCookie,
  logAuthDebug,
} from "@/features/auth/utils/auth-cookie";
import { normalizeAuthRedirectTarget } from "@/features/auth/utils/auth-redirect";
import { getCookieValueFromSetCookieHeaders } from "@/lib/auth-helpers";
import type { ApiResult } from "@/types";

const isProduction = process.env.NODE_ENV === "production";
const PENDING_VERIFICATION_COOKIE_NAME = "pending_verification_email";
const PENDING_VERIFICATION_MAX_AGE = 15 * 60;
const PENDING_PASSWORD_RESET_COOKIE_NAME = "pending_password_reset_email";
const PENDING_PASSWORD_RESET_MAX_AGE = 15 * 60;
const PENDING_POST_AUTH_REDIRECT_COOKIE_NAME = "pending_post_auth_redirect";
const PENDING_POST_AUTH_REDIRECT_MAX_AGE = 15 * 60;

export class MissingAuthRefreshTokenError extends Error {
  constructor() {
    super("Authentication response did not include a refresh token cookie.");
    this.name = "MissingAuthRefreshTokenError";
  }
}

const clearCompletedAuthFlowCookies = async (): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.set({
    httpOnly: true,
    maxAge: 0,
    name: PENDING_VERIFICATION_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: "",
  });

  cookieStore.set({
    httpOnly: true,
    maxAge: 0,
    name: PENDING_PASSWORD_RESET_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: "",
  });

  cookieStore.set({
    httpOnly: true,
    maxAge: 0,
    name: PENDING_POST_AUTH_REDIRECT_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: "",
  });
};

const clearLegacyAuthCookies = async (): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.set(
    buildClearedAppRefreshTokenCookie(LEGACY_BACKEND_REFRESH_TOKEN_COOKIE_PATH),
  );
  cookieStore.set(buildClearedBackendRefreshTokenCookie());
};

export const persistAuthSession = async (
  result: ApiResult<AuthResponse>,
): Promise<void> => {
  const refreshTokenValue = getCookieValueFromSetCookieHeaders(
    result.headers,
    BACKEND_REFRESH_TOKEN_COOKIE_NAME,
  );

  if (!refreshTokenValue) {
    logAuthDebug("persistAuthSession.missingRefreshToken", {
      appCookieName: APP_REFRESH_TOKEN_COOKIE_NAME,
      sourceCookieName: BACKEND_REFRESH_TOKEN_COOKIE_NAME,
    });
    throw new MissingAuthRefreshTokenError();
  }

  logAuthDebug("persistAuthSession.success", {
    appCookieName: APP_REFRESH_TOKEN_COOKIE_NAME,
    sourceCookieName: BACKEND_REFRESH_TOKEN_COOKIE_NAME,
  });

  const cookieStore = await cookies();
  cookieStore.set(buildAccessTokenCookie(result.data.accessToken));
  cookieStore.set(buildAppRefreshTokenCookie(refreshTokenValue));

  await clearLegacyAuthCookies();
  await clearCompletedAuthFlowCookies();
};

export const clearAuthSession = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set(buildClearedAccessTokenCookie());
  cookieStore.set(buildClearedAppRefreshTokenCookie());
  await clearLegacyAuthCookies();

  cookieStore.set({
    httpOnly: true,
    maxAge: 0,
    name: PENDING_VERIFICATION_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: "",
  });

  cookieStore.set({
    httpOnly: true,
    maxAge: 0,
    name: PENDING_PASSWORD_RESET_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: "",
  });

  cookieStore.set({
    httpOnly: true,
    maxAge: 0,
    name: PENDING_POST_AUTH_REDIRECT_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: "",
  });
};

export const persistPendingVerificationEmail = async (
  email: string,
): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.set({
    httpOnly: true,
    maxAge: PENDING_VERIFICATION_MAX_AGE,
    name: PENDING_VERIFICATION_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: email,
  });
};

export const getPendingVerificationEmail = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const email = cookieStore.get(PENDING_VERIFICATION_COOKIE_NAME)?.value?.trim();

  return email ? email : null;
};

export const clearPendingVerificationEmail = async (): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.set({
    httpOnly: true,
    maxAge: 0,
    name: PENDING_VERIFICATION_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: "",
  });
};

export const persistPendingPasswordResetEmail = async (
  email: string,
): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.set({
    httpOnly: true,
    maxAge: PENDING_PASSWORD_RESET_MAX_AGE,
    name: PENDING_PASSWORD_RESET_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: email,
  });
};

export const getPendingPasswordResetEmail = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const email = cookieStore.get(PENDING_PASSWORD_RESET_COOKIE_NAME)?.value?.trim();

  return email ? email : null;
};

export const clearPendingPasswordResetEmail = async (): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.set({
    httpOnly: true,
    maxAge: 0,
    name: PENDING_PASSWORD_RESET_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: "",
  });
};

export const persistPendingPostAuthRedirect = async (
  redirectTo: string,
): Promise<void> => {
  const normalizedRedirect = normalizeAuthRedirectTarget(redirectTo);

  if (!normalizedRedirect) {
    return;
  }

  const cookieStore = await cookies();

  cookieStore.set({
    httpOnly: true,
    maxAge: PENDING_POST_AUTH_REDIRECT_MAX_AGE,
    name: PENDING_POST_AUTH_REDIRECT_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: normalizedRedirect,
  });
};

export const getPendingPostAuthRedirect = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const redirectTo = cookieStore.get(PENDING_POST_AUTH_REDIRECT_COOKIE_NAME)?.value;

  return normalizeAuthRedirectTarget(redirectTo);
};

export const clearPendingPostAuthRedirect = async (): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.set({
    httpOnly: true,
    maxAge: 0,
    name: PENDING_POST_AUTH_REDIRECT_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: "",
  });
};

export const maskEmailAddress = (email: string): string => {
  const [localPart = "", domainPart = ""] = email.split("@");
  const visibleLocalPart = localPart.slice(0, Math.min(2, localPart.length));
  const maskedLocalPart = `${visibleLocalPart}${"*".repeat(
    Math.max(localPart.length - visibleLocalPart.length, 2),
  )}`;

  if (!domainPart) {
    return maskedLocalPart;
  }

  const [domainName = "", domainSuffix = ""] = domainPart.split(".");
  const visibleDomainName = domainName.slice(0, 1);
  const maskedDomainName = `${visibleDomainName}${"*".repeat(
    Math.max(domainName.length - visibleDomainName.length, 2),
  )}`;

  return domainSuffix
    ? `${maskedLocalPart}@${maskedDomainName}.${domainSuffix}`
    : `${maskedLocalPart}@${maskedDomainName}`;
};
