import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { oauthExchangeSchema } from "@/features/auth/schemas/auth.schema";
import {
  applyAuthResultResponseCookies,
} from "@/features/auth/services/auth-response-cookie.service";
import { authService } from "@/features/auth/services/auth.service";
import {
  buildLoginRedirectPath,
  normalizeAuthRedirectTarget,
} from "@/features/auth/utils/auth-redirect";
import { ApiError } from "@/lib/api/error";

const mapOAuthExchangeErrorCode = (error: ApiError): string => {
  if (
    error.status === 401 &&
    (error.message === "OAuth login ticket is invalid or expired" ||
      error.message === "OAuth login ticket has expired")
  ) {
    return "oauth_exchange_failed";
  }

  return "google_sign_in_failed";
};

const buildLoginErrorResponse = (
  request: NextRequest,
  errorCode: string,
  redirectTo?: string | null,
): NextResponse => {
  const normalizedRedirectTo = normalizeAuthRedirectTarget(redirectTo);
  const loginUrl = new URL(
    buildLoginRedirectPath(normalizedRedirectTo),
    request.url,
  );

  loginUrl.searchParams.set("oauth_error", errorCode);

  return NextResponse.redirect(loginUrl);
};

export async function GET(request: NextRequest) {
  const ticketResult = oauthExchangeSchema.safeParse({
    ticket: request.nextUrl.searchParams.get("ticket"),
  });
  const redirectTo = request.nextUrl.searchParams.get("redirectTo");

  if (!ticketResult.success) {
    return buildLoginErrorResponse(request, "oauth_exchange_failed", redirectTo);
  }

  try {
    const result = await authService.exchangeOAuthTicket(ticketResult.data);
    const destination = normalizeAuthRedirectTarget(redirectTo) ?? "/";
    const response = NextResponse.redirect(new URL(destination, request.url));

    return applyAuthResultResponseCookies(response, result);
  } catch (error) {
    if (error instanceof ApiError) {
      return buildLoginErrorResponse(
        request,
        mapOAuthExchangeErrorCode(error),
        redirectTo,
      );
    }

    if (error instanceof Error) {
      return buildLoginErrorResponse(
        request,
        "oauth_exchange_failed",
        redirectTo,
      );
    }

    throw error;
  }
}
