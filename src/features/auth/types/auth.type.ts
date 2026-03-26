import type { LoginInput } from "@/features/auth/schemas/auth.schema";
import type { User } from "@/features/user/types/user.type";

export interface LoginApiResponse {
  access_token: string;
  user: User;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export type LoginFieldErrors = Partial<Record<keyof LoginInput, string[]>>;

export interface LoginActionState {
  fieldErrors?: LoginFieldErrors;
  message?: string;
  redirectTo?: string;
  success: boolean;
}
