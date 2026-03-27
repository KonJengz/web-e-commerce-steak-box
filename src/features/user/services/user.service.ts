import "server-only";

import type {
  ChangePasswordInput,
  RequestEmailChangeInput,
  SetPasswordInput,
  UpdateProfileInput,
  VerifyEmailChangeInput,
} from "@/features/user/schemas/profile.schema";
import type { User, UserProfile } from "@/features/user/types/user.type";
import { api } from "@/lib/api/client";
import type { ApiResult } from "@/types";

interface MeApiResponse {
  created_at: string;
  email: string;
  has_password: boolean;
  id: string;
  image: string | null;
  is_active: boolean;
  is_verified: boolean;
  name: string;
  role: User["role"];
}

interface MessageApiResponse {
  message: string;
}

const mapUserProfile = (data: MeApiResponse): UserProfile => {
  return {
    createdAt: data.created_at,
    email: data.email,
    hasPassword: data.has_password,
    id: data.id,
    image: data.image,
    isActive: data.is_active,
    isVerified: data.is_verified,
    name: data.name,
    role: data.role,
  };
};

const getMe = async (accessToken: string): Promise<ApiResult<UserProfile>> => {
  const result = await api.get<MeApiResponse>("/api/users/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    ...result,
    data: mapUserProfile(result.data),
  };
};

const updateProfile = async (
  accessToken: string,
  input: UpdateProfileInput,
): Promise<ApiResult<UserProfile>> => {
  const formData = new FormData();

  if (input.name !== undefined) {
    formData.set("name", input.name.trim());
  }

  if (input.image) {
    formData.set("image", input.image);
  }

  if (input.removeImage) {
    formData.set("remove_image", "true");
  }

  const result = await api.put<MeApiResponse>("/api/users/me/profile", formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    ...result,
    data: mapUserProfile(result.data),
  };
};

const requestEmailChange = async (
  accessToken: string,
  input: RequestEmailChangeInput,
): Promise<ApiResult<MessageApiResponse>> => {
  return api.put<MessageApiResponse>("/api/users/me", input, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const verifyEmailChange = async (
  accessToken: string,
  input: VerifyEmailChangeInput,
): Promise<ApiResult<UserProfile>> => {
  const result = await api.post<MeApiResponse>(
    "/api/users/me/verify-email-change",
    input,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return {
    ...result,
    data: mapUserProfile(result.data),
  };
};

const changePassword = async (
  accessToken: string,
  input: ChangePasswordInput,
): Promise<ApiResult<MessageApiResponse>> => {
  return api.put<MessageApiResponse>(
    "/api/users/me/password",
    {
      current_password: input.currentPassword,
      new_password: input.newPassword,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
};

const setPassword = async (
  accessToken: string,
  input: SetPasswordInput,
): Promise<ApiResult<MessageApiResponse>> => {
  return api.post<MessageApiResponse>(
    "/api/users/me/set-password",
    {
      new_password: input.newPassword,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
};

export const userService = {
  changePassword,
  getMe,
  requestEmailChange,
  setPassword,
  updateProfile,
  verifyEmailChange,
};
