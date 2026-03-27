import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { applyResolvedSessionCookies } from "@/features/auth/services/auth-response-cookie.service";
import { normalizePostAuthRedirect } from "@/features/auth/services/auth-session.service";
import { authService } from "@/features/auth/services/auth.service";
import {
  resolveRequestAuthSession,
  type RequestAuthSession,
} from "@/features/auth/services/request-auth-session.service";
import {
  getSetCookieHeaders,
} from "@/lib/auth-helpers";
import { ApiError } from "@/lib/api/error";

const normalizeSecurityRedirect = (
  redirectTo: string | null | undefined,
): string => {
  return normalizePostAuthRedirect(redirectTo) ?? "/security";
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
  const session = await resolveRequestAuthSession(request);

  if (!session) {
    return buildLoginRedirect(request, redirectTo);
  }

  try {
    const result = await authService.startGoogleLink(session.accessToken, redirectTo);
    const response = NextResponse.redirect(result.data.authorizeUrl);

    applyResolvedSessionCookies(
      response,
      session as RequestAuthSession,
    );

    for (const setCookieHeader of getSetCookieHeaders(result.headers)) {
      response.headers.append("Set-Cookie", setCookieHeader);
    }

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        return buildLoginRedirect(request, redirectTo);
      }

      return buildLinkErrorRedirect(request, redirectTo, mapLinkErrorCode(error));
    }

    return buildLinkErrorRedirect(request, redirectTo, "google_link_failed");
  }
}
