import type { NextResponse } from "next/server";

import type { RequestAuthSession } from "@/features/auth/services/request-auth-session.service";
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
  buildExpiredCookieHeader,
  logAuthDebug,
} from "@/features/auth/utils/auth-cookie";
import { getCookieValueFromSetCookieHeaders } from "@/lib/auth-helpers";
import type { ApiResult } from "@/types";

const clearLegacyRefreshTokenResponseCookie = (response: NextResponse): void => {
  response.cookies.set(buildClearedBackendRefreshTokenCookie());
  response.headers.append(
    "Set-Cookie",
    buildExpiredCookieHeader(
      BACKEND_REFRESH_TOKEN_COOKIE_NAME,
      LEGACY_BACKEND_REFRESH_TOKEN_COOKIE_PATH,
    ),
  );
};

const clearLegacyAppRefreshTokenResponseCookie = (
  response: NextResponse,
): void => {
  response.headers.append(
    "Set-Cookie",
    buildExpiredCookieHeader(
      APP_REFRESH_TOKEN_COOKIE_NAME,
      LEGACY_BACKEND_REFRESH_TOKEN_COOKIE_PATH,
    ),
  );
};

export const setAccessTokenResponseCookie = (
  response: NextResponse,
  accessToken: string,
): void => {
  response.cookies.set(buildAccessTokenCookie(accessToken));
};

export const setRefreshTokenResponseCookie = (
  response: NextResponse,
  refreshToken: string,
): void => {
  clearLegacyAppRefreshTokenResponseCookie(response);
  clearLegacyRefreshTokenResponseCookie(response);

  response.cookies.set({
    ...buildAppRefreshTokenCookie(refreshToken),
  });
};

export const clearAuthResponseCookies = (response: NextResponse): NextResponse => {
  response.cookies.set(buildClearedAccessTokenCookie());
  response.cookies.set(buildClearedAppRefreshTokenCookie());
  clearLegacyAppRefreshTokenResponseCookie(response);
  clearLegacyRefreshTokenResponseCookie(response);

  return response;
};

export const applyAuthResultResponseCookies = (
  response: NextResponse,
  result: ApiResult<AuthResponse>,
): NextResponse => {
  const refreshTokenValue = getCookieValueFromSetCookieHeaders(
    result.headers,
    BACKEND_REFRESH_TOKEN_COOKIE_NAME,
  );

  if (!refreshTokenValue) {
    logAuthDebug("applyAuthResultResponseCookies.missingRefreshToken", {
      sourceCookieName: BACKEND_REFRESH_TOKEN_COOKIE_NAME,
    });
    throw new Error("Authentication response did not include a refresh token cookie.");
  }

  logAuthDebug("applyAuthResultResponseCookies.success", {
    appCookieName: APP_REFRESH_TOKEN_COOKIE_NAME,
    sourceCookieName: BACKEND_REFRESH_TOKEN_COOKIE_NAME,
  });

  setAccessTokenResponseCookie(response, result.data.accessToken);
  setRefreshTokenResponseCookie(response, refreshTokenValue);

  return response;
};

export const applyResolvedSessionCookies = (
  response: NextResponse,
  session: RequestAuthSession,
): NextResponse => {
  if (!session.refreshedSession) {
    return response;
  }

  setAccessTokenResponseCookie(response, session.accessToken);

  if (session.refreshedSession.refreshToken) {
    setRefreshTokenResponseCookie(response, session.refreshedSession.refreshToken);
  } else {
    response.cookies.set(buildClearedAppRefreshTokenCookie());
    clearLegacyAppRefreshTokenResponseCookie(response);
    clearLegacyRefreshTokenResponseCookie(response);
  }

  return response;
};
