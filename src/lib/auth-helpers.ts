import { envServer } from "@/config/env.server";
import { authService } from "@/features/auth/services/auth.service";
import { ApiError } from "@/lib/api/error";

export interface RefreshedAuthSession {
  accessToken: string;
  refreshToken: string | null;
}

export interface RefreshAuthFailure {
  message: string;
  reason: string;
  status: number;
}

export interface RefreshAccessTokenResult {
  failure: RefreshAuthFailure | null;
  session: RefreshedAuthSession | null;
}

const splitSetCookieHeader = (header: string): string[] => {
  return header.split(/,(?=\s*[A-Za-z0-9!#$%&'*+.^_`|~-]+=)/);
};

export const getSetCookieHeaders = (headers: Headers): string[] => {
  const headersWithGetSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof headersWithGetSetCookie.getSetCookie === "function") {
    return headersWithGetSetCookie.getSetCookie();
  }

  const combinedHeader = headers.get("set-cookie");

  if (!combinedHeader) {
    return [];
  }

  return splitSetCookieHeader(combinedHeader);
};

export const getCookieValueFromSetCookieHeaders = (
  headers: Headers,
  cookieName: string,
): string | null => {
  const setCookieHeaders = getSetCookieHeaders(headers);

  for (const header of setCookieHeaders) {
    const match = header.match(new RegExp(`^${cookieName}=([^;]+)`));

    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
};

interface JwtPayload {
  exp?: number;
}

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const encodedPayload = token.split(".")[1];

    if (!encodedPayload) {
      return null;
    }

    const normalizedPayload = encodedPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      "=",
    );

    return JSON.parse(
      Buffer.from(paddedPayload, "base64").toString("utf8"),
    ) as JwtPayload;
  } catch {
    return null;
  }
};

export const isAccessTokenExpired = (token: string): boolean => {
  const payload = decodeJwtPayload(token);

  if (!payload || typeof payload.exp !== "number") {
    return true;
  }

  return payload.exp * 1000 <= Date.now() + 5_000;
};

export const mapRefreshApiErrorReason = (error: ApiError): string => {
  if (error.status !== 401) {
    return "refresh_api_error";
  }

  if (error.message === "No refresh token cookie") {
    return "backend_missing_refresh_cookie";
  }

  if (error.message === "Invalid refresh token") {
    return "invalid_refresh_token";
  }

  if (error.message === "Refresh token has expired") {
    return "expired_refresh_token";
  }

  if (error.message === "Refresh session has been revoked. Please login again.") {
    return "revoked_refresh_session";
  }

  if (error.message === "Refresh token reuse detected. Please login again.") {
    return "refresh_token_reuse_detected";
  }

  return "refresh_api_error";
};

export const attemptRefreshAccessToken = async (
  refreshToken: string,
): Promise<RefreshAccessTokenResult> => {
  try {
    const result = await authService.refresh(refreshToken);

    return {
      failure: null,
      session: {
        accessToken: result.data.accessToken,
        refreshToken: getCookieValueFromSetCookieHeaders(
          result.headers,
          envServer.REFRESH_TOKEN_COOKIE_NAME,
        ),
      },
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        failure: {
          message: error.message,
          reason: mapRefreshApiErrorReason(error),
          status: error.status,
        },
        session: null,
      };
    }

    throw error;
  }
};
