import "server-only";

import { envClient } from "@/config/env.client";
import { envServer } from "@/config/env.server";
import type {
  ForgotPasswordInput,
  LoginInput,
  OAuthExchangeInput,
  RegisterInput,
  ResetPasswordInput,
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

interface OAuthLinkStartApiResponse {
  authorize_url: string;
}

interface OAuthLinkStartResponse {
  authorizeUrl: string;
}

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

const forgotPassword = async (
  data: ForgotPasswordInput,
): Promise<ApiResult<{ message: string }>> => {
  return api.post<{ message: string }>("/api/auth/forgot-password", data);
};

const resetPassword = async (
  data: ResetPasswordInput,
): Promise<ApiResult<{ message: string }>> => {
  return api.post<{ message: string }>("/api/auth/reset-password", data);
};

const exchangeOAuthTicket = async (
  data: OAuthExchangeInput,
): Promise<ApiResult<AuthResponse>> => {
  const result = await api.post<AuthApiResponse>("/api/auth/oauth/exchange", data);

  return mapAuthResponse(result);
};

const startGoogleLink = async (
  accessToken: string,
  redirectTo?: string | null,
): Promise<ApiResult<OAuthLinkStartResponse>> => {
  const result = await api.post<OAuthLinkStartApiResponse>(
    "/api/auth/google/link/start",
    {
      redirect_to: normalizeOAuthRedirectTarget(redirectTo),
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return {
    ...result,
    data: {
      authorizeUrl: result.data.authorize_url,
    },
  };
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

const buildGoogleLinkStartHref = (redirectTo?: string | null): string => {
  const normalizedRedirect = normalizeOAuthRedirectTarget(redirectTo);
  const searchParams = new URLSearchParams({
    redirectTo: normalizedRedirect,
  });

  return `/api/auth/google/link/start?${searchParams.toString()}`;
};

export const authService = {
  buildGoogleLinkStartHref,
  buildGoogleStartHref,
  exchangeOAuthTicket,
  forgotPassword,
  login,
  logout,
  refresh,
  register,
  resetPassword,
  resendVerification,
  startGoogleLink,
  verifyEmail,
};
