import "server-only";

import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { envServer } from "@/config/env.server";
import { REQUEST_ACCESS_TOKEN_HEADER_NAME } from "@/features/auth/services/request-auth-session.service";
import { userService } from "@/features/user/services/user.service";
import type { UserProfile } from "@/features/user/types/user.type";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import { isAccessTokenExpired } from "@/lib/auth-helpers";
import { ApiError } from "@/lib/api/error";

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
  redirectToPath: string,
): Promise<string> => {
  const accessToken = await getCurrentAccessToken();

  if (!accessToken) {
    redirect(buildLoginRedirectPath(redirectToPath));
  }

  return accessToken;
};

export const requireCurrentUser = async (
  redirectToPath: string,
): Promise<UserProfile> => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(buildLoginRedirectPath(redirectToPath));
  }

  return currentUser;
};

export const requireAdminUser = async (
  redirectToPath: string = "/admin",
): Promise<UserProfile> => {
  const currentUser = await requireCurrentUser(redirectToPath);

  if (currentUser.role !== "ADMIN") {
    redirect("/");
  }

  return currentUser;
};
