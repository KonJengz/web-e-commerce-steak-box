import "server-only";

import { cookies } from "next/headers";

import { envServer } from "@/config/env.server";
import {
  isAccessTokenExpired,
  refreshAccessToken,
  type RefreshedAuthSession,
} from "@/lib/auth-helpers";
import { ApiError } from "@/lib/api/error";

const isProduction = process.env.NODE_ENV === "production";

const refreshFlights = new Map<string, Promise<RefreshedAuthSession | null>>();

interface ServerAuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

interface ResolvedServerAuthSession {
  accessToken: string;
  refreshToken: string | null;
}

class ServerAuthRequiredError extends Error {
  constructor() {
    super("Authentication is required to complete this request.");
    this.name = "ServerAuthRequiredError";
  }
}

const readServerAuthTokens = async (): Promise<ServerAuthTokens> => {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get(envServer.ACCESS_TOKEN_COOKIE_NAME)?.value ?? null,
    refreshToken: cookieStore.get(envServer.REFRESH_TOKEN_COOKIE_NAME)?.value ?? null,
  };
};

const persistRefreshedSessionCookies = async (
  refreshedSession: RefreshedAuthSession,
): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.set({
    httpOnly: true,
    maxAge: envServer.ACCESS_TOKEN_MAX_AGE,
    name: envServer.ACCESS_TOKEN_COOKIE_NAME,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
    value: refreshedSession.accessToken,
  });

  if (refreshedSession.refreshToken) {
    cookieStore.set({
      httpOnly: true,
      maxAge: envServer.REFRESH_TOKEN_MAX_AGE,
      name: envServer.REFRESH_TOKEN_COOKIE_NAME,
      path: "/",
      sameSite: "strict",
      secure: isProduction,
      value: refreshedSession.refreshToken,
    });

    return;
  }

  cookieStore.set({
    httpOnly: true,
    maxAge: 0,
    name: envServer.REFRESH_TOKEN_COOKIE_NAME,
    path: "/",
    sameSite: "strict",
    secure: isProduction,
    value: "",
  });
};

const refreshAccessTokenSingleFlight = async (
  refreshToken: string,
): Promise<RefreshedAuthSession | null> => {
  const inFlightRefresh = refreshFlights.get(refreshToken);

  if (inFlightRefresh) {
    return inFlightRefresh;
  }

  const refreshPromise = refreshAccessToken(refreshToken).finally(() => {
    refreshFlights.delete(refreshToken);
  });

  refreshFlights.set(refreshToken, refreshPromise);

  return refreshPromise;
};

const refreshServerAuthSession = async (
  refreshToken: string,
): Promise<ResolvedServerAuthSession | null> => {
  const refreshedSession = await refreshAccessTokenSingleFlight(refreshToken);

  if (!refreshedSession) {
    return null;
  }

  await persistRefreshedSessionCookies(refreshedSession);

  return {
    accessToken: refreshedSession.accessToken,
    refreshToken: refreshedSession.refreshToken,
  };
};

export const executeWithServerAuthRetry = async <T>(
  operation: (accessToken: string) => Promise<T>,
): Promise<T> => {
  const initialTokens = await readServerAuthTokens();
  let accessToken = initialTokens.accessToken;
  let refreshToken = initialTokens.refreshToken;
  let hasRefreshedSession = false;

  if (!accessToken || isAccessTokenExpired(accessToken)) {
    if (!refreshToken) {
      throw new ServerAuthRequiredError();
    }

    const refreshedSession = await refreshServerAuthSession(refreshToken);

    if (!refreshedSession) {
      throw new ServerAuthRequiredError();
    }

    accessToken = refreshedSession.accessToken;
    refreshToken = refreshedSession.refreshToken;
    hasRefreshedSession = true;
  }

  try {
    return await operation(accessToken);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    if (hasRefreshedSession || !refreshToken) {
      throw new ServerAuthRequiredError();
    }

    const refreshedSession = await refreshServerAuthSession(refreshToken);

    if (!refreshedSession) {
      throw new ServerAuthRequiredError();
    }

    return operation(refreshedSession.accessToken);
  }
};

export const isServerAuthRequiredError = (
  error: unknown,
): error is ServerAuthRequiredError => {
  return error instanceof ServerAuthRequiredError;
};
