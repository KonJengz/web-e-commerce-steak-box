import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { envServer } from "@/config/env.server";
import {
  clearAuthResponseCookies,
  setAccessTokenResponseCookie,
  setRefreshTokenResponseCookie,
} from "@/features/auth/services/auth-response-cookie.service";
import { authService } from "@/features/auth/services/auth.service";
import { getRequestRefreshToken } from "@/features/auth/services/request-auth-session.service";
import {
  APP_REFRESH_TOKEN_COOKIE_NAME,
  BACKEND_REFRESH_TOKEN_COOKIE_NAME,
  logAuthDebug,
} from "@/features/auth/utils/auth-cookie";
import {
  buildLoginRedirectPath,
  resolveAuthRedirectTarget,
} from "@/features/auth/utils/auth-redirect";
import {
  getCookieValueFromSetCookieHeaders,
  mapRefreshApiErrorReason,
} from "@/lib/auth-helpers";
import { ApiError } from "@/lib/api/error";

const buildLoginRedirectResponse = (
  request: NextRequest,
  redirectTo: string,
  reason: string,
  details?: {
    message?: string;
    status?: number;
  },
): NextResponse => {
  const loginUrl = new URL(
    buildLoginRedirectPath(redirectTo, { forceLogin: true }),
    request.url,
  );
  loginUrl.searchParams.set("authReason", reason);

  if (process.env.NODE_ENV !== "production") {
    if (typeof details?.status === "number") {
      loginUrl.searchParams.set("authStatus", String(details.status));
    }

    if (details?.message) {
      loginUrl.searchParams.set("authMessage", details.message);
    }
  }

  return clearAuthResponseCookies(NextResponse.redirect(loginUrl));
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  const redirectTo = resolveAuthRedirectTarget(
    request.nextUrl.searchParams.get("redirectTo"),
    "/",
  );
  const refreshToken = getRequestRefreshToken(request);

  logAuthDebug("route.refresh.request", {
    appCookieName: APP_REFRESH_TOKEN_COOKIE_NAME,
    hasRefreshToken: Boolean(refreshToken),
    redirectTo,
  });

  if (!refreshToken) {
    return buildLoginRedirectResponse(request, redirectTo, "missing_refresh_cookie");
  }

  try {
    const result = await authService.refresh(refreshToken);
    const nextRefreshToken = getCookieValueFromSetCookieHeaders(
      result.headers,
      envServer.REFRESH_TOKEN_COOKIE_NAME,
    );

    if (!nextRefreshToken) {
      logAuthDebug("route.refresh.missingBackendSetCookie", {
        sourceCookieName: BACKEND_REFRESH_TOKEN_COOKIE_NAME,
      });
      return buildLoginRedirectResponse(
        request,
        redirectTo,
        "missing_backend_set_cookie",
      );
    }

    logAuthDebug("route.refresh.success", {
      appCookieName: APP_REFRESH_TOKEN_COOKIE_NAME,
      sourceCookieName: BACKEND_REFRESH_TOKEN_COOKIE_NAME,
      redirectTo,
    });

    const response = NextResponse.redirect(new URL(redirectTo, request.url));

    setAccessTokenResponseCookie(response, result.data.accessToken);
    setRefreshTokenResponseCookie(response, nextRefreshToken);

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      logAuthDebug("route.refresh.apiError", {
        message: error.message,
        redirectTo,
        status: error.status,
      });
      return buildLoginRedirectResponse(
        request,
        redirectTo,
        mapRefreshApiErrorReason(error),
        {
          message: error.message,
          status: error.status,
        },
      );
    }

    throw error;
  }
}
