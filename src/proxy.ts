import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { envServer } from "@/config/env.server";
import {
  isAccessTokenExpired,
  refreshAccessToken,
} from "@/lib/auth-helpers";
import {
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/features/auth/constants/auth.constants";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

const protectedRoutes = [
  "/profile",
  "/addresses",
  "/orders",
  "/checkout",
  "/admin",
] as const;

const authRoutes = ["/login", "/register"] as const;

const isProduction = process.env.NODE_ENV === "production";

const matchesPath = (pathname: string, route: string): boolean => {
  return pathname === route || pathname.startsWith(`${route}/`);
};

const isProtectedRoute = (pathname: string): boolean => {
  return protectedRoutes.some((route) => matchesPath(pathname, route));
};

const isAuthRoute = (pathname: string): boolean => {
  return authRoutes.some((route) => pathname === route);
};

const applySecurityHeaders = (response: NextResponse): NextResponse => {
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (isProduction) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  return response;
};

const setAccessTokenCookie = (
  response: NextResponse,
  accessToken: string,
): void => {
  response.cookies.set({
    httpOnly: true,
    maxAge: ACCESS_TOKEN_MAX_AGE,
    name: envServer.ACCESS_TOKEN_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: accessToken,
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

const setRefreshTokenCookie = (
  response: NextResponse,
  refreshToken: string,
): void => {
  response.cookies.set({
    httpOnly: true,
    maxAge: REFRESH_TOKEN_MAX_AGE,
    name: envServer.REFRESH_TOKEN_COOKIE_NAME,
    path: "/",
    sameSite: "strict",
    secure: isProduction,
    value: refreshToken,
  });
};

const redirectTo = (request: NextRequest, pathname: string): NextResponse => {
  return applySecurityHeaders(
    NextResponse.redirect(new URL(pathname, request.url)),
  );
};

const tryRefreshSession = async (
  request: NextRequest,
  response: NextResponse,
): Promise<NextResponse | null> => {
  const refreshToken = request.cookies.get(envServer.REFRESH_TOKEN_COOKIE_NAME)?.value;

  if (!refreshToken) {
    return null;
  }

  const refreshedSession = await refreshAccessToken(refreshToken);

  if (!refreshedSession) {
    return null;
  }

  setAccessTokenCookie(response, refreshedSession.accessToken);

  if (refreshedSession.refreshToken) {
    setRefreshTokenCookie(response, refreshedSession.refreshToken);
  }

  return response;
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(envServer.ACCESS_TOKEN_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(envServer.REFRESH_TOKEN_COOKIE_NAME)?.value;
  const hasAccessToken = Boolean(accessToken);
  const hasRefreshToken = Boolean(refreshToken);
  const isProtected = isProtectedRoute(pathname);
  const isAuth = isAuthRoute(pathname);
  const hasValidAccessToken = accessToken
    ? !isAccessTokenExpired(accessToken)
    : false;

  if (isProtected) {
    if (hasValidAccessToken) {
      return applySecurityHeaders(NextResponse.next());
    }

    if (hasRefreshToken) {
      try {
        const response = applySecurityHeaders(NextResponse.next());
        const refreshedResponse = await tryRefreshSession(request, response);

        if (refreshedResponse) {
          return refreshedResponse;
        }
      } catch {
        const response = redirectTo(request, "/login");
        return clearAuthCookies(response);
      }
    }

    const response = redirectTo(request, "/login");
    return clearAuthCookies(response);
  }

  if (isAuth) {
    if (hasValidAccessToken) {
      return redirectTo(request, "/");
    }

    if (hasRefreshToken) {
      try {
        const response = redirectTo(request, "/");
        const refreshedResponse = await tryRefreshSession(request, response);

        if (refreshedResponse) {
          return refreshedResponse;
        }
      } catch {
        const response = applySecurityHeaders(NextResponse.next());
        return clearAuthCookies(response);
      }

      const response = applySecurityHeaders(NextResponse.next());
      return clearAuthCookies(response);
    }

    if (hasAccessToken) {
      const response = applySecurityHeaders(NextResponse.next());
      return clearAuthCookies(response);
    }
  }

  return applySecurityHeaders(NextResponse.next());
}
