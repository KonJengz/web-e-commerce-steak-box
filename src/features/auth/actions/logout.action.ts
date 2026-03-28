"use server";

import { cookies } from "next/headers";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

import { envServer } from "@/config/env.server";
import { clearAuthSession } from "@/features/auth/services/auth-session.service";
import { authService } from "@/features/auth/services/auth.service";
import {
  getStoredRefreshTokenValue,
} from "@/features/auth/utils/auth-cookie";
import {
  getCookieValueFromSetCookieHeaders,
  isAccessTokenExpired,
} from "@/lib/auth-helpers";

export async function logoutAction(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const storedAccessToken =
      cookieStore.get(envServer.ACCESS_TOKEN_COOKIE_NAME)?.value ?? null;
    const storedRefreshToken = getStoredRefreshTokenValue(cookieStore);
    let accessToken =
      storedAccessToken && !isAccessTokenExpired(storedAccessToken)
        ? storedAccessToken
        : null;
    let refreshToken = storedRefreshToken;

    if (!accessToken && refreshToken) {
      try {
        const refreshedSession = await authService.refresh(refreshToken);
        accessToken = refreshedSession.data.accessToken;
        refreshToken =
          getCookieValueFromSetCookieHeaders(
            refreshedSession.headers,
            envServer.REFRESH_TOKEN_COOKIE_NAME,
          ) ?? refreshToken;
      } catch (error) {
        console.error("Backend refresh before logout failed:", error);
      }
    }

    if (accessToken) {
      try {
        await authService.logout(accessToken, refreshToken ?? undefined);
      } catch (error) {
        console.error("Backend logout failed:", error);
      }
    }

    await clearAuthSession();
    redirect("/login");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("Logout action failed:", error);
    redirect("/login");
  }
}
