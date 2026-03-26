import "server-only";

import { envServer } from "@/config/env.server";
import type { LoginInput } from "@/features/auth/schemas/auth.schema";
import type {
  LoginApiResponse,
  LoginResponse,
} from "@/features/auth/types/auth.type";
import { api } from "@/lib/api/client";
import type { ApiResult } from "@/types";

const login = async (data: LoginInput): Promise<ApiResult<LoginResponse>> => {
  const result = await api.post<LoginApiResponse>("/api/auth/login", data);

  return {
    ...result,
    data: {
      accessToken: result.data.access_token,
      user: result.data.user,
    },
  };
};

const refresh = async (
  refreshToken: string,
): Promise<ApiResult<LoginResponse>> => {
  const result = await api.post<LoginApiResponse>("/api/auth/refresh", undefined, {
    headers: {
      Cookie: `${envServer.REFRESH_TOKEN_COOKIE_NAME}=${encodeURIComponent(refreshToken)}`,
    },
  });

  return {
    ...result,
    data: {
      accessToken: result.data.access_token,
      user: result.data.user,
    },
  };
};

const logout = async (accessToken: string): Promise<ApiResult<{ message: string }>> => {
  return api.post<{ message: string }>("/api/auth/logout", undefined, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const authService = {
  login,
  logout,
  refresh,
};
