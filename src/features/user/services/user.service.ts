import "server-only";

import type { User } from "@/features/user/types/user.type";
import { api } from "@/lib/api/client";
import type { ApiResult } from "@/types";

interface MeApiResponse {
  created_at: string;
  email: string;
  id: string;
  image: string | null;
  is_active: boolean;
  is_verified: boolean;
  name: string;
  role: User["role"];
}

const getMe = async (accessToken: string): Promise<ApiResult<User>> => {
  const result = await api.get<MeApiResponse>("/api/users/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    ...result,
    data: {
      email: result.data.email,
      id: result.data.id,
      image: result.data.image,
      name: result.data.name,
      role: result.data.role,
    },
  };
};

export const userService = {
  getMe,
};
