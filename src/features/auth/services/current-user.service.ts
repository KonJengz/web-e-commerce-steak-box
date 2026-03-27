import "server-only";

import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { envServer } from "@/config/env.server";
import { REQUEST_ACCESS_TOKEN_HEADER_NAME, REQUEST_PATH_HEADER_NAME } from "@/features/auth/services/request-auth-session.service";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import { userService } from "@/features/user/services/user.service";
import type { UserProfile } from "@/features/user/types/user.type";
import { isAccessTokenExpired } from "@/lib/auth-helpers";
import { ApiError } from "@/lib/api/error";

const getResolvedRedirectPath = async (
  redirectToPath?: string,
): Promise<string> => {
  if (redirectToPath) {
    return redirectToPath;
  }

  const requestHeaders = await headers();

  return requestHeaders.get(REQUEST_PATH_HEADER_NAME) ?? "/";
};

const redirectToForcedLogin = async (
  redirectToPath?: string,
): Promise<never> => {
  redirect(
    buildLoginRedirectPath(await getResolvedRedirectPath(redirectToPath), {
      forceLogin: true,
    }),
  );
};

export const getCurrentAccessToken = cache(async (): Promise<string | null> => {
  const requestHeaders = await headers();
  const headerAccessToken = requestHeaders.get(REQUEST_ACCESS_TOKEN_HEADER_NAME);

  if (headerAccessToken && !isAccessTokenExpired(headerAccessToken)) {
    return headerAccessToken;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(envServer.ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (!accessToken || isAccessTokenExpired(accessToken)) {
    return null;
  }

  return accessToken;
});

export const getCurrentUser = cache(async (): Promise<UserProfile | null> => {
  const accessToken = await getCurrentAccessToken();

  if (!accessToken) {
    return null;
  }

  try {
    const result = await userService.getMe(accessToken);

    return result.data;
  } catch (error) {
    if (error instanceof ApiError) {
      return null;
    }

    throw error;
  }
});

export const requireCurrentAccessToken = async (
  redirectToPath?: string,
): Promise<string> => {
  const accessToken = await getCurrentAccessToken();

  if (!accessToken) {
    return redirectToForcedLogin(redirectToPath);
  }

  return accessToken;
};

export const executeProtectedRequestOrRedirect = async <T>(
  operation: (accessToken: string) => Promise<T>,
  redirectToPath?: string,
): Promise<T> => {
  const accessToken = await requireCurrentAccessToken(redirectToPath);

  try {
    return await operation(accessToken);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return redirectToForcedLogin(redirectToPath);
    }

    throw error;
  }
};

export const requireCurrentUser = async (
  redirectToPath?: string,
): Promise<UserProfile> => {
  try {
    return await executeProtectedRequestOrRedirect(
      async (accessToken) => {
        const result = await userService.getMe(accessToken);

        return result.data;
      },
      redirectToPath,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return redirectToForcedLogin(redirectToPath);
    }

    throw error;
  }
};

export const requireAdminUser = async (
  redirectToPath?: string,
): Promise<UserProfile> => {
  const currentUser = await requireCurrentUser(redirectToPath);

  if (currentUser.role !== "ADMIN") {
    redirect("/");
  }

  return currentUser;
};
