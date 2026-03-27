import type { NextRequest } from "next/server";

import { envServer } from "@/config/env.server";
import {
  isAccessTokenExpired,
  type RefreshedAuthSession,
} from "@/lib/auth-helpers";
import { refreshAccessTokenSingleFlight } from "@/features/auth/services/auth-refresh-coordinator.service";

export const REQUEST_ACCESS_TOKEN_HEADER_NAME = "x-auth-access-token";

export interface RequestAuthSession {
  accessToken: string;
  refreshedSession: RefreshedAuthSession | null;
}

export const getRequestAccessToken = (request: NextRequest): string | null => {
  return request.cookies.get(envServer.ACCESS_TOKEN_COOKIE_NAME)?.value ?? null;
};

export const getRequestRefreshToken = (request: NextRequest): string | null => {
  return request.cookies.get(envServer.REFRESH_TOKEN_COOKIE_NAME)?.value ?? null;
};

export const hasValidRequestAccessToken = (request: NextRequest): boolean => {
  const accessToken = getRequestAccessToken(request);

  return accessToken ? !isAccessTokenExpired(accessToken) : false;
};

export const resolveRequestAuthSession = async (
  request: NextRequest,
): Promise<RequestAuthSession | null> => {
  const accessToken = getRequestAccessToken(request);

  if (accessToken && !isAccessTokenExpired(accessToken)) {
    return {
      accessToken,
      refreshedSession: null,
    };
  }

  const refreshToken = getRequestRefreshToken(request);

  if (!refreshToken) {
    return null;
  }

  const refreshedSession = await refreshAccessTokenSingleFlight(refreshToken);

  if (!refreshedSession) {
    return null;
  }

  return {
    accessToken: refreshedSession.accessToken,
    refreshedSession,
  };
};

export const buildRequestHeadersWithAuthSession = (
  request: NextRequest,
  session: RequestAuthSession,
): Headers => {
  const requestHeaders = new Headers(request.headers);
  const cookieEntries = new Map<string, string>();

  for (const cookie of request.cookies.getAll()) {
    cookieEntries.set(cookie.name, cookie.value);
  }

  cookieEntries.set(envServer.ACCESS_TOKEN_COOKIE_NAME, session.accessToken);

  if (session.refreshedSession) {
    if (session.refreshedSession.refreshToken) {
      cookieEntries.set(
        envServer.REFRESH_TOKEN_COOKIE_NAME,
        session.refreshedSession.refreshToken,
      );
    } else {
      cookieEntries.delete(envServer.REFRESH_TOKEN_COOKIE_NAME);
    }
  }

  const cookieHeader = Array.from(cookieEntries.entries())
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join("; ");

  if (cookieHeader) {
    requestHeaders.set("cookie", cookieHeader);
  } else {
    requestHeaders.delete("cookie");
  }

  requestHeaders.set(REQUEST_ACCESS_TOKEN_HEADER_NAME, session.accessToken);

  return requestHeaders;
};
