import "server-only";

import { cookies } from "next/headers";

import { envServer } from "@/config/env.server";
import type { AuthResponse } from "@/features/auth/types/auth.type";
import { getCookieValueFromSetCookieHeaders } from "@/lib/auth-helpers";
import type { ApiResult } from "@/types";

const isProduction = process.env.NODE_ENV === "production";
const PENDING_VERIFICATION_COOKIE_NAME = "pending_verification_email";
const PENDING_VERIFICATION_MAX_AGE = 15 * 60;
const PENDING_POST_AUTH_REDIRECT_COOKIE_NAME = "pending_post_auth_redirect";
const PENDING_POST_AUTH_REDIRECT_MAX_AGE = 15 * 60;

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
    name: PENDING_POST_AUTH_REDIRECT_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: "",
  });

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

export const normalizePostAuthRedirect = (
  value: string | null | undefined,
): string | null => {
  const candidate = value?.trim();

  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return null;
  }

  if (candidate.startsWith("/login") || candidate.startsWith("/verify-email")) {
    return null;
  }

  return candidate;
};

export const persistPendingPostAuthRedirect = async (
  redirectTo: string,
): Promise<void> => {
  const normalizedRedirect = normalizePostAuthRedirect(redirectTo);

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

  return normalizePostAuthRedirect(redirectTo);
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
