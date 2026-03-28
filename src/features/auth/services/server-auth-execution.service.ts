import "server-only";

import { cookies } from "next/headers";

import { envServer } from "@/config/env.server";
import { refreshAccessTokenSingleFlight as refreshAuthSessionSingleFlight } from "@/features/auth/services/auth-refresh-coordinator.service";
import { userService } from "@/features/user/services/user.service";
import {
  buildAccessTokenCookie,
  buildAppRefreshTokenCookie,
  buildClearedAppRefreshTokenCookie,
  buildClearedBackendRefreshTokenCookie,
  getStoredRefreshTokenValue,
  LEGACY_BACKEND_REFRESH_TOKEN_COOKIE_PATH,
} from "@/features/auth/utils/auth-cookie";
import {
  isAccessTokenExpired,
  type RefreshedAuthSession,
} from "@/lib/auth-helpers";
import { ApiError } from "@/lib/api/error";

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

class ServerAdminAuthorizationRequiredError extends Error {
  constructor() {
    super("Administrator access is required to complete this request.");
    this.name = "ServerAdminAuthorizationRequiredError";
  }
}

const readServerAuthTokens = async (): Promise<ServerAuthTokens> => {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get(envServer.ACCESS_TOKEN_COOKIE_NAME)?.value ?? null,
    refreshToken: getStoredRefreshTokenValue(cookieStore),
  };
};

const persistRefreshedSessionCookies = async (
  refreshedSession: RefreshedAuthSession,
): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set(buildAccessTokenCookie(refreshedSession.accessToken));

  if (refreshedSession.refreshToken) {
    cookieStore.set(
      buildClearedAppRefreshTokenCookie(LEGACY_BACKEND_REFRESH_TOKEN_COOKIE_PATH),
    );
    cookieStore.set(buildClearedBackendRefreshTokenCookie());
    cookieStore.set(buildAppRefreshTokenCookie(refreshedSession.refreshToken));

    return;
  }

  cookieStore.set(
    buildClearedAppRefreshTokenCookie(LEGACY_BACKEND_REFRESH_TOKEN_COOKIE_PATH),
  );
  cookieStore.set(buildClearedAppRefreshTokenCookie());
  cookieStore.set(buildClearedBackendRefreshTokenCookie());
};

const refreshAccessTokenSingleFlight = async (
  refreshToken: string,
): Promise<RefreshedAuthSession | null> => {
  return refreshAuthSessionSingleFlight(refreshToken);
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

export const executeWithAdminServerAuthRetry = async <T>(
  operation: (accessToken: string) => Promise<T>,
): Promise<T> => {
  return executeWithServerAuthRetry(async (accessToken) => {
    const currentUser = await userService.getMe(accessToken);

    if (currentUser.data.role !== "ADMIN") {
      throw new ServerAdminAuthorizationRequiredError();
    }

    return operation(accessToken);
  });
};

export const isServerAuthRequiredError = (
  error: unknown,
): error is ServerAuthRequiredError => {
  return error instanceof ServerAuthRequiredError;
};

export const isServerAdminAuthorizationRequiredError = (
  error: unknown,
): error is ServerAdminAuthorizationRequiredError => {
  return error instanceof ServerAdminAuthorizationRequiredError;
};
