import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  applyResolvedSessionCookies,
  clearAuthResponseCookies,
} from "@/features/auth/services/auth-response-cookie.service";
import {
  buildRequestHeadersWithAuthSession,
  getRequestAccessToken,
  getRequestRefreshToken,
  hasValidRequestAccessToken,
  REQUEST_PATH_HEADER_NAME,
  resolveRequestAuthSession,
  type RequestAuthSession,
} from "@/features/auth/services/request-auth-session.service";
import {
  buildLoginRedirectPath,
  buildSessionRefreshPath,
  FORCE_LOGIN_QUERY_PARAM,
  normalizeAuthRedirectTarget,
} from "@/features/auth/utils/auth-redirect";
import {
  logAuthDebug,
} from "@/features/auth/utils/auth-cookie";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|__nextjs_source-map|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
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
const contentSecurityPolicyHeaderValue = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: http: https:",
  "font-src 'self' data:",
  `connect-src 'self'${isProduction ? "" : " ws: wss:"}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");
const permissionsPolicyHeaderValue = [
  "accelerometer=()",
  "camera=()",
  "geolocation=()",
  "gyroscope=()",
  "microphone=()",
  "payment=()",
  "usb=()",
].join(", ");

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
  response.headers.set(
    "Content-Security-Policy",
    contentSecurityPolicyHeaderValue,
  );
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Permissions-Policy", permissionsPolicyHeaderValue);
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");

  if (isProduction) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  return response;
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

const redirectTo = (request: NextRequest, pathname: string): NextResponse => {
  return applySecurityHeaders(
    NextResponse.redirect(new URL(pathname, request.url)),
  );
};

const createResponseWithResolvedSession = (
  request: NextRequest,
  session: RequestAuthSession,
  requestHeaders?: Headers,
): NextResponse => {
  return createNextResponse(
    requestHeaders ?? buildRequestHeadersWithAuthSession(request, session),
  );
};

const createResponseWithPersistedResolvedSession = (
  request: NextRequest,
  session: RequestAuthSession,
  requestHeaders?: Headers,
): NextResponse => {
  return applyResolvedSessionCookies(
    createResponseWithResolvedSession(request, session, requestHeaders),
    session,
  );
};

const createRedirectResponseWithPersistedResolvedSession = (
  request: NextRequest,
  session: RequestAuthSession,
  pathname: string,
): NextResponse => {
  return applyResolvedSessionCookies(redirectTo(request, pathname), session);
};

const redirectToLogin = (
  request: NextRequest,
  redirectToPath: string,
  options?: {
    authMessage?: string;
    authReason?: string;
    authStatus?: number;
    forceLogin?: boolean;
  },
): NextResponse => {
  const loginUrl = new URL(
    buildLoginRedirectPath(redirectToPath, options),
    request.url,
  );

  if (options?.authReason) {
    loginUrl.searchParams.set("authReason", options.authReason);
  }

  if (typeof options?.authStatus === "number") {
    loginUrl.searchParams.set("authStatus", String(options.authStatus));
  }

  if (process.env.NODE_ENV !== "production" && options?.authMessage) {
    loginUrl.searchParams.set("authMessage", options.authMessage);
  }

  return applySecurityHeaders(NextResponse.redirect(loginUrl));
};

/**
 * Main Proxy / Middleware Logic
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const forceLogin =
    request.nextUrl.searchParams.get(FORCE_LOGIN_QUERY_PARAM) === "1";

  // ดึงข้อมูล Token จาก Request
  const accessToken = getRequestAccessToken(request);
  const refreshToken = getRequestRefreshToken(request);

  const hasAccessToken = Boolean(accessToken);
  const hasRefreshToken = Boolean(refreshToken);
  const hasValidAccessToken = hasValidRequestAccessToken(request);

  const isProtected = isProtectedRoute(pathname);
  const isAuth = isAuthRoute(pathname);
  const requestPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  // เตรียม Active Session (เฉพาะกรณีที่ Access Token ยังไม่หมดอายุ)
  const activeSession =
    hasValidAccessToken && accessToken
      ? ({
          accessToken,
          refreshedSession: null,
        } satisfies RequestAuthSession)
      : null;

  const resolvedSession =
    !activeSession && hasRefreshToken
      ? await resolveRequestAuthSession(request)
      : {
          failure: null,
          session: null,
        };

  // --- CASE 1: หน้าที่ต้องล็อกอิน (Protected Routes) ---
  if (isProtected) {
    // 1.1 ถ้า Session ยัง Valid อยู่ -> ให้ผ่านไปได้เลย
    if (activeSession) {
      return createResponseWithResolvedSession(request, activeSession);
    }

    if (resolvedSession.session) {
      logAuthDebug("proxy.protected.refreshSucceeded", {
        path: requestPath,
      });
      return createResponseWithPersistedResolvedSession(
        request,
        resolvedSession.session,
      );
    }

    if (!resolvedSession.failure) {
      logAuthDebug("proxy.protected.delegateToRefreshRoute", {
        hasAccessToken,
        hasRefreshToken,
        hasValidAccessToken,
        path: requestPath,
      });
      return redirectTo(request, buildSessionRefreshPath(requestPath));
    }

    logAuthDebug("proxy.protected.refreshFailed", {
      failureMessage: resolvedSession.failure?.message ?? null,
      failureReason: resolvedSession.failure?.reason ?? null,
      failureStatus: resolvedSession.failure?.status ?? null,
      hasAccessToken,
      hasRefreshToken,
      hasValidAccessToken,
      path: requestPath,
    });
    return clearAuthResponseCookies(
      redirectToLogin(request, requestPath, {
        authMessage: resolvedSession.failure?.message,
        authReason: resolvedSession.failure?.reason,
        authStatus: resolvedSession.failure?.status,
        forceLogin: true,
      }),
    );
  }

  // --- CASE 2: หน้าล็อกอิน/สมัครสมาชิก (Auth Routes) ---
  if (isAuth) {
    // ถ้าโดนสั่ง Force Login ให้ล้างคุกกี้ก่อน
    if (forceLogin) {
      return clearAuthResponseCookies(createNextResponse());
    }

    // ถ้าล็อกอินอยู่แล้วแต่พยายามเข้าหน้า Login อีก -> Redirect ไปหน้าปลายทาง หรือหน้า Home
    if (activeSession) {
      const redirectToParam = request.nextUrl.searchParams.get("redirectTo");
      const destination = normalizeAuthRedirectTarget(redirectToParam) ?? "/";
      return redirectTo(request, destination);
    }

    if (resolvedSession.session) {
      const redirectToParam = request.nextUrl.searchParams.get("redirectTo");
      const destination = normalizeAuthRedirectTarget(redirectToParam) ?? "/";

      return createRedirectResponseWithPersistedResolvedSession(
        request,
        resolvedSession.session,
        destination,
      );
    }

    return createNextResponse();
  }

  // --- CASE 3: หน้าทั่วไป (Public Routes) ---

  // ถ้ามี Access Token ค้างอยู่แต่ใช้ไม่ได้แล้ว และไม่มีทางต่ออายุ (ไม่มี Refresh Token) -> ล้างคุกกี้ทิ้ง
  if (hasAccessToken && !hasValidAccessToken && !hasRefreshToken) {
    return clearAuthResponseCookies(createNextResponse());
  }

  // ถ้า Session ยังโอเค (แม้จะเป็นหน้า Public) ก็แนบ Session Header ไปให้ Backend ด้วย
  if (activeSession) {
    return createResponseWithResolvedSession(request, activeSession);
  }

  if (resolvedSession.session) {
    return createResponseWithPersistedResolvedSession(
      request,
      resolvedSession.session,
    );
  }

  // กรณีอื่นๆ (Public User) แนบ Path เดิมส่งไปที่ Header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_PATH_HEADER_NAME, requestPath);

  return createNextResponse(requestHeaders);
}
