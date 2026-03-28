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

const hasSameOriginRequestContext = (request: NextRequest): boolean => {
  const requestOrigin = request.nextUrl.origin;
  const originHeader = request.headers.get("origin");

  if (originHeader) {
    try {
      return new URL(originHeader).origin === requestOrigin;
    } catch {
      return false;
    }
  }

  const refererHeader = request.headers.get("referer");

  if (!refererHeader) {
    return false;
  }

  try {
    return new URL(refererHeader).origin === requestOrigin;
  } catch {
    return false;
  }
};

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

export async function POST(request: NextRequest): Promise<NextResponse> {
  const formData = await request.formData();
  const redirectTo = normalizeSecurityRedirect(
    typeof formData.get("redirectTo") === "string"
      ? (formData.get("redirectTo") as string)
      : null,
  );

  if (!hasSameOriginRequestContext(request)) {
    return buildLinkErrorRedirect(request, redirectTo, "invalid_request_origin");
  }

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
