import { envServer } from "@/config/env.server";
import { authService } from "@/features/auth/services/auth.service";
import type { UserRole } from "@/features/user/types/user.type";
import { ApiError } from "@/lib/api/error";

export interface RefreshedAuthSession {
  accessToken: string;
  refreshToken: string | null;
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
  role?: unknown;
  user?: {
    role?: unknown;
  };
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

const isUserRole = (value: unknown): value is UserRole => {
  return value === "ADMIN" || value === "USER";
};

export const isAccessTokenExpired = (token: string): boolean => {
  const payload = decodeJwtPayload(token);

  if (!payload || typeof payload.exp !== "number") {
    return true;
  }

  return payload.exp * 1000 <= Date.now() + 5_000;
};

export const getAccessTokenRole = (token: string): UserRole | null => {
  const payload = decodeJwtPayload(token);

  if (!payload) {
    return null;
  }

  if (isUserRole(payload.role)) {
    return payload.role;
  }

  if (isUserRole(payload.user?.role)) {
    return payload.user.role;
  }

  return null;
};

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<RefreshedAuthSession | null> => {
  try {
    const result = await authService.refresh(refreshToken);

    return {
      accessToken: result.data.accessToken,
      refreshToken: getCookieValueFromSetCookieHeaders(
        result.headers,
        envServer.REFRESH_TOKEN_COOKIE_NAME,
      ),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return null;
    }

    throw error;
  }
};
