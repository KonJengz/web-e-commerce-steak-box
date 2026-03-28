import type { NextRequest } from "next/server";

import { envServer } from "@/config/env.server";
import {
  isAccessTokenExpired,
  type RefreshAuthFailure,
  type RefreshedAuthSession,
} from "@/lib/auth-helpers";
import {
  attemptRefreshAccessTokenSingleFlight,
} from "@/features/auth/services/auth-refresh-coordinator.service";
import {
  getStoredRefreshTokenValue,
  normalizeCookieValue,
  APP_REFRESH_TOKEN_COOKIE_NAME,
  BACKEND_REFRESH_TOKEN_COOKIE_NAME,
} from "@/features/auth/utils/auth-cookie";

export const REQUEST_ACCESS_TOKEN_HEADER_NAME = "x-auth-access-token";
export const REQUEST_PATH_HEADER_NAME = "x-auth-request-path";

export interface RequestAuthSession {
  accessToken: string;
  refreshedSession: RefreshedAuthSession | null;
}

export interface RequestAuthSessionResolution {
  failure: RefreshAuthFailure | null;
  session: RequestAuthSession | null;
}

const getCookieValueFromRequestHeader = (
  request: NextRequest,
  cookieName: string,
): string | null => {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  const cookieEntries = cookieHeader.split(";");

  for (const entry of cookieEntries) {
    const trimmedEntry = entry.trim();

    if (!trimmedEntry.startsWith(`${cookieName}=`)) {
      continue;
    }

    const cookieValue = trimmedEntry.slice(cookieName.length + 1);

    try {
      const decodedCookieValue = decodeURIComponent(cookieValue);

      if (decodedCookieValue.length > 0) {
        return decodedCookieValue;
      }
    } catch {
      if (cookieValue.length > 0) {
        return cookieValue;
      }
    }
  }

  return null;
};

export const getRequestAccessToken = (request: NextRequest): string | null => {
  return (
    normalizeCookieValue(
      request.cookies.get(envServer.ACCESS_TOKEN_COOKIE_NAME)?.value,
    ) ??
    getCookieValueFromRequestHeader(request, envServer.ACCESS_TOKEN_COOKIE_NAME)
  );
};

export const getRequestRefreshToken = (request: NextRequest): string | null => {
  return (
    getStoredRefreshTokenValue(request.cookies) ??
    getCookieValueFromRequestHeader(request, APP_REFRESH_TOKEN_COOKIE_NAME) ??
    getCookieValueFromRequestHeader(request, BACKEND_REFRESH_TOKEN_COOKIE_NAME) ??
    null
  );
};

export const hasValidRequestAccessToken = (request: NextRequest): boolean => {
  const accessToken = getRequestAccessToken(request);

  return accessToken ? !isAccessTokenExpired(accessToken) : false;
};

export const resolveRequestAuthSession = async (
  request: NextRequest,
): Promise<RequestAuthSessionResolution> => {
  const accessToken = getRequestAccessToken(request);

  if (accessToken && !isAccessTokenExpired(accessToken)) {
    return {
      failure: null,
      session: {
        accessToken,
        refreshedSession: null,
      },
    };
  }

  const refreshToken = getRequestRefreshToken(request);

  if (!refreshToken) {
    return {
      failure: null,
      session: null,
    };
  }

  const refreshResult = await attemptRefreshAccessTokenSingleFlight(refreshToken);
  const refreshedSession = refreshResult.session;

  if (!refreshedSession) {
    return {
      failure: refreshResult.failure,
      session: null,
    };
  }

  return {
    failure: null,
    session: {
      accessToken: refreshedSession.accessToken,
      refreshedSession,
    },
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
        APP_REFRESH_TOKEN_COOKIE_NAME,
        session.refreshedSession.refreshToken,
      );
    } else {
      cookieEntries.delete(APP_REFRESH_TOKEN_COOKIE_NAME);
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
  requestHeaders.set(
    REQUEST_PATH_HEADER_NAME,
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  return requestHeaders;
};
