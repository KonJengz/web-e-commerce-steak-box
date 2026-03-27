import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { envServer } from "@/config/env.server";
import { normalizePostAuthRedirect } from "@/features/auth/services/auth-session.service";
import { authService } from "@/features/auth/services/auth.service";
import {
  getSetCookieHeaders,
  isAccessTokenExpired,
  refreshAccessToken,
} from "@/lib/auth-helpers";
import { ApiError } from "@/lib/api/error";

const isProduction = process.env.NODE_ENV === "production";

interface ActiveSession {
  accessToken: string;
  refreshedSession?: {
    accessToken: string;
    refreshToken: string | null;
  };
}

const normalizeSecurityRedirect = (
  redirectTo: string | null | undefined,
): string => {
  return normalizePostAuthRedirect(redirectTo) ?? "/security";
};

const setAccessTokenCookie = (
  response: NextResponse,
  accessToken: string,
): void => {
  response.cookies.set({
    httpOnly: true,
    maxAge: envServer.ACCESS_TOKEN_MAX_AGE,
    name: envServer.ACCESS_TOKEN_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: accessToken,
  });
};

const setRefreshTokenCookie = (
  response: NextResponse,
  refreshToken: string,
): void => {
  response.cookies.set({
    httpOnly: true,
    maxAge: envServer.REFRESH_TOKEN_MAX_AGE,
    name: envServer.REFRESH_TOKEN_COOKIE_NAME,
    path: "/",
    sameSite: "strict",
    secure: isProduction,
    value: refreshToken,
  });
};

const clearAuthCookies = (response: NextResponse): NextResponse => {
  response.cookies.set({
    httpOnly: true,
    maxAge: 0,
    name: envServer.ACCESS_TOKEN_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: "",
  });

  response.cookies.set({
    httpOnly: true,
    maxAge: 0,
    name: envServer.REFRESH_TOKEN_COOKIE_NAME,
    path: "/",
    sameSite: "strict",
    secure: isProduction,
    value: "",
  });

  return response;
};

const buildLoginRedirect = (
  request: NextRequest,
  redirectTo: string,
): NextResponse => {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", redirectTo);

  return NextResponse.redirect(loginUrl);
};

const buildLinkErrorRedirect = (
  request: NextRequest,
  redirectTo: string,
  errorCode: string,
): NextResponse => {
  const destinationUrl = new URL(redirectTo, request.url);
  destinationUrl.searchParams.set("link_provider", "google");
  destinationUrl.searchParams.set("link_error", errorCode);

  return NextResponse.redirect(destinationUrl);
};

const resolveSession = async (
  request: NextRequest,
): Promise<ActiveSession | null> => {
  const accessToken =
    request.cookies.get(envServer.ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (accessToken && !isAccessTokenExpired(accessToken)) {
    return {
      accessToken,
    };
  }

  const refreshToken =
    request.cookies.get(envServer.REFRESH_TOKEN_COOKIE_NAME)?.value;

  if (!refreshToken) {
    return null;
  }

  const refreshedSession = await refreshAccessToken(refreshToken);

  if (!refreshedSession) {
    return null;
  }

  return {
    accessToken: refreshedSession.accessToken,
    refreshedSession,
  };
};

const mapLinkErrorCode = (error: ApiError): string => {
  if (error.status === 403 && error.message === "Account is suspended") {
    return "account_suspended";
  }

  return "google_link_failed";
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  const redirectTo = normalizeSecurityRedirect(
    request.nextUrl.searchParams.get("redirectTo"),
  );
  const session = await resolveSession(request);

  if (!session) {
    const response = buildLoginRedirect(request, redirectTo);

    return clearAuthCookies(response);
  }

  try {
    const result = await authService.startGoogleLink(session.accessToken, redirectTo);
    const response = NextResponse.redirect(result.data.authorizeUrl);

    if (session.refreshedSession) {
      setAccessTokenCookie(response, session.refreshedSession.accessToken);

      if (session.refreshedSession.refreshToken) {
        setRefreshTokenCookie(response, session.refreshedSession.refreshToken);
      }
    }

    for (const setCookieHeader of getSetCookieHeaders(result.headers)) {
      response.headers.append("Set-Cookie", setCookieHeader);
    }

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        const response = buildLoginRedirect(request, redirectTo);

        return clearAuthCookies(response);
      }

      return buildLinkErrorRedirect(request, redirectTo, mapLinkErrorCode(error));
    }

    return buildLinkErrorRedirect(request, redirectTo, "google_link_failed");
  }
}
