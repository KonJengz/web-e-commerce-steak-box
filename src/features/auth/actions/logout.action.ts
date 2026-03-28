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

export async function logoutAction(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(envServer.ACCESS_TOKEN_COOKIE_NAME)?.value;
    const refreshToken = getStoredRefreshTokenValue(cookieStore);

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
