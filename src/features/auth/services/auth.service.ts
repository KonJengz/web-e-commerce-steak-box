import "server-only";

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

export const authService = {
  login,
};
