import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { oauthExchangeSchema } from "@/features/auth/schemas/auth.schema";
import {
  normalizePostAuthRedirect,
  persistAuthSession,
} from "@/features/auth/services/auth-session.service";
import { authService } from "@/features/auth/services/auth.service";
import { ApiError } from "@/lib/api/error";

const buildLoginErrorResponse = (
  request: NextRequest,
  redirectTo?: string | null,
): NextResponse => {
  const loginUrl = new URL("/login", request.url);
  const normalizedRedirectTo = normalizePostAuthRedirect(redirectTo);

  loginUrl.searchParams.set("oauth_error", "google_sign_in_failed");

  if (normalizedRedirectTo) {
    loginUrl.searchParams.set("redirectTo", normalizedRedirectTo);
  }

  return NextResponse.redirect(loginUrl);
};

export async function GET(request: NextRequest) {
  const ticketResult = oauthExchangeSchema.safeParse({
    ticket: request.nextUrl.searchParams.get("ticket"),
  });
  const redirectTo = request.nextUrl.searchParams.get("redirectTo");

  if (!ticketResult.success) {
    return buildLoginErrorResponse(request, redirectTo);
  }

  try {
    const result = await authService.exchangeOAuthTicket(ticketResult.data);
    await persistAuthSession(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return buildLoginErrorResponse(request, redirectTo);
    }

    throw error;
  }

  const destination = normalizePostAuthRedirect(redirectTo) ?? "/";

  return NextResponse.redirect(new URL(destination, request.url));
}
