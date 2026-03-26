import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";

import { envServer } from "@/config/env.server";
import { userService } from "@/features/user/services/user.service";
import type { UserProfile } from "@/features/user/types/user.type";
import { isAccessTokenExpired } from "@/lib/auth-helpers";
import { ApiError } from "@/lib/api/error";

export const getCurrentAccessToken = cache(async (): Promise<string | null> => {
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
