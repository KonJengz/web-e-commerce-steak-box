import "server-only";

import { envClient } from "@/config/env.client";
import { envServer } from "@/config/env.server";
import type {
  LoginInput,
  OAuthExchangeInput,
  RegisterInput,
  ResendVerificationInput,
  VerifyEmailInput,
} from "@/features/auth/schemas/auth.schema";
import type {
  AuthApiResponse,
  AuthResponse,
} from "@/features/auth/types/auth.type";
import { api } from "@/lib/api/client";
import type { ApiResult } from "@/types";

const normalizeOAuthRedirectTarget = (
  value: string | null | undefined,
): string => {
  const candidate = value?.trim();

  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/";
  }

  if (candidate.startsWith("/login") || candidate.startsWith("/verify-email")) {
    return "/";
  }

  return candidate;
};

const mapAuthResponse = (
  result: ApiResult<AuthApiResponse>,
): ApiResult<AuthResponse> => {
  return {
    ...result,
    data: {
      accessToken: result.data.access_token,
      user: result.data.user,
    },
  };
};

const login = async (data: LoginInput): Promise<ApiResult<AuthResponse>> => {
  const result = await api.post<AuthApiResponse>("/api/auth/login", data);

  return mapAuthResponse(result);
};

const refresh = async (
  refreshToken: string,
): Promise<ApiResult<AuthResponse>> => {
  const result = await api.post<AuthApiResponse>(
    "/api/auth/refresh",
    undefined,
    {
      headers: {
        Cookie: `${envServer.REFRESH_TOKEN_COOKIE_NAME}=${encodeURIComponent(refreshToken)}`,
      },
    },
  );

  return mapAuthResponse(result);
};

const logout = async (
  accessToken: string,
  refreshToken?: string,
): Promise<ApiResult<{ message: string }>> => {
  const headers = new Headers({
    Authorization: `Bearer ${accessToken}`,
  });

  if (refreshToken) {
    headers.set(
      "Cookie",
      `${envServer.REFRESH_TOKEN_COOKIE_NAME}=${encodeURIComponent(refreshToken)}`,
    );
  }

  return api.post<{ message: string }>("/api/auth/logout", undefined, {
    headers,
  });
};

const register = async (
  data: Omit<RegisterInput, "confirmPassword">,
): Promise<ApiResult<{ message: string }>> => {
  return api.post<{ message: string }>("/api/auth/register", data);
};

const verifyEmail = async (
  data: VerifyEmailInput,
): Promise<ApiResult<AuthResponse>> => {
  const result = await api.post<AuthApiResponse>("/api/auth/verify-email", data);

  return mapAuthResponse(result);
};

const resendVerification = async (
  data: ResendVerificationInput,
): Promise<ApiResult<{ message: string }>> => {
  return api.post<{ message: string }>("/api/auth/resend-verification", data);
};

const exchangeOAuthTicket = async (
  data: OAuthExchangeInput,
): Promise<ApiResult<AuthResponse>> => {
  const result = await api.post<AuthApiResponse>("/api/auth/oauth/exchange", data);

  return mapAuthResponse(result);
};

const buildGoogleStartHref = (redirectTo?: string | null): string => {
  const exchangeUrl = new URL(
    "/login/oauth/callback",
    envClient.NEXT_PUBLIC_APP_URL,
  ).toString();
  const startUrl = new URL("/api/auth/google/start", envServer.BACKEND_URL);

  startUrl.searchParams.set("exchange_url", exchangeUrl);
  startUrl.searchParams.set(
    "redirect_to",
    normalizeOAuthRedirectTarget(redirectTo),
  );

  return startUrl.toString();
};

export const authService = {
  buildGoogleStartHref,
  exchangeOAuthTicket,
  login,
  logout,
  refresh,
  register,
  resendVerification,
  verifyEmail,
};
