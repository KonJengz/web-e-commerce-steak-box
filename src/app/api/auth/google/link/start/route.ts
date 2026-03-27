import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { authService } from "@/features/auth/services/auth.service";
import {
  executeWithServerAuthRetry,
  isServerAuthRequiredError,
} from "@/features/auth/services/server-auth-execution.service";
import {
  buildLoginRedirectPath,
  resolveAuthRedirectTarget,
} from "@/features/auth/utils/auth-redirect";
import {
  getSetCookieHeaders,
} from "@/lib/auth-helpers";
import { ApiError } from "@/lib/api/error";

const normalizeSecurityRedirect = (
  redirectTo: string | null | undefined,
): string => {
  return resolveAuthRedirectTarget(redirectTo, "/security");
};

const buildLoginRedirect = (
  request: NextRequest,
  redirectTo: string,
): NextResponse => {
  const loginUrl = new URL(buildLoginRedirectPath(redirectTo), request.url);

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

  try {
    const result = await executeWithServerAuthRetry((accessToken) =>
      authService.startGoogleLink(accessToken, redirectTo),
    );
    const response = NextResponse.redirect(result.data.authorizeUrl);

    for (const setCookieHeader of getSetCookieHeaders(result.headers)) {
      response.headers.append("Set-Cookie", setCookieHeader);
    }

    return response;
  } catch (error) {
    if (isServerAuthRequiredError(error)) {
      return buildLoginRedirect(request, redirectTo);
    }

    if (error instanceof ApiError) {
      return buildLinkErrorRedirect(request, redirectTo, mapLinkErrorCode(error));
    }

    return buildLinkErrorRedirect(request, redirectTo, "google_link_failed");
  }
}
