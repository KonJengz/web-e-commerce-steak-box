import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { applyResolvedSessionCookies } from "@/features/auth/services/auth-response-cookie.service";
import { clearAuthResponseCookies } from "@/features/auth/services/auth-response-cookie.service";
import {
  buildRequestHeadersWithAuthSession,
  getRequestAccessToken,
  getRequestRefreshToken,
  hasValidRequestAccessToken,
  resolveRequestAuthSession,
  type RequestAuthSession,
} from "@/features/auth/services/request-auth-session.service";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

const protectedRoutes = [
  "/profile",
  "/security",
  "/addresses",
  "/orders",
  "/checkout",
  "/admin",
] as const;

const authRoutes = ["/login", "/register", "/verify-email"] as const;

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

const createNextResponse = (requestHeaders?: Headers): NextResponse => {
  return applySecurityHeaders(
    requestHeaders
      ? NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      : NextResponse.next(),
  );
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

const redirectTo = (request: NextRequest, pathname: string): NextResponse => {
  return applySecurityHeaders(
    NextResponse.redirect(new URL(pathname, request.url)),
  );
};

const redirectToLogin = (request: NextRequest): NextResponse => {
  const redirectTarget = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const loginUrl = new URL(buildLoginRedirectPath(redirectTarget), request.url);

  return applySecurityHeaders(NextResponse.redirect(loginUrl));
};

const createResponseWithResolvedSession = (
  request: NextRequest,
  session: RequestAuthSession,
): NextResponse => {
  const response = createNextResponse(
    buildRequestHeadersWithAuthSession(request, session),
  );

  return applyResolvedSessionCookies(response, session);
};

const applyResolvedSessionToRedirect = (
  response: NextResponse,
  session: RequestAuthSession | null,
): NextResponse => {
  if (!session) {
    return response;
  }

  return applyResolvedSessionCookies(response, session);
};

const resolveSessionSafely = async (
  request: NextRequest,
): Promise<RequestAuthSession | null> => {
  try {
    return await resolveRequestAuthSession(request);
  } catch {
    return null;
  }
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = getRequestAccessToken(request);
  const refreshToken = getRequestRefreshToken(request);
  const hasAccessToken = Boolean(accessToken);
  const hasRefreshToken = Boolean(refreshToken);
  const hasValidAccessToken = hasValidRequestAccessToken(request);
  const isProtected = isProtectedRoute(pathname);
  const isAuth = isAuthRoute(pathname);
  const resolvedSession =
    !hasValidAccessToken && hasRefreshToken
      ? await resolveSessionSafely(request)
      : null;
  const activeSession =
    hasValidAccessToken && accessToken
      ? ({
          accessToken,
          refreshedSession: null,
        } satisfies RequestAuthSession)
      : resolvedSession;

  if (isProtected) {
    if (!activeSession) {
      return clearAuthResponseCookies(redirectToLogin(request));
    }

    return createResponseWithResolvedSession(request, activeSession);
  }

  if (isAuth) {
    if (activeSession) {
      return applyResolvedSessionToRedirect(redirectTo(request, "/"), activeSession);
    }

    return createNextResponse();
  }

  if (resolvedSession?.refreshedSession) {
    return createResponseWithResolvedSession(request, resolvedSession);
  }

  if (hasAccessToken && !hasValidAccessToken && !hasRefreshToken) {
    return clearAuthResponseCookies(createNextResponse());
  }

  if (!activeSession && (hasAccessToken || hasRefreshToken)) {
    return clearAuthResponseCookies(createNextResponse());
  }

  return createNextResponse();
}
