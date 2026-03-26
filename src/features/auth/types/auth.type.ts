import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordSubmissionInput,
  VerifyEmailSubmissionInput,
} from "@/features/auth/schemas/auth.schema";
import type { User } from "@/features/user/types/user.type";

export interface AuthApiResponse {
  access_token: string;
  user: User;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export type LoginFieldErrors = Partial<Record<keyof LoginInput, string[]>>;

export interface LoginActionState {
  fieldErrors?: LoginFieldErrors;
  message?: string;
  requiresEmailVerification?: boolean;
  redirectTo?: string;
  success: boolean;
}

export type RegisterFieldErrors = Partial<Record<keyof RegisterInput, string[]>>;

export interface RegisterActionState {
  fieldErrors?: RegisterFieldErrors;
  message?: string;
  redirectTo?: string;
  success: boolean;
}

export type VerifyEmailFieldErrors = Partial<
  Record<keyof VerifyEmailSubmissionInput, string[]>
>;

export interface VerifyEmailActionState {
  fieldErrors?: VerifyEmailFieldErrors;
  message?: string;
  redirectTo?: string;
  success: boolean;
}

export interface ResendVerificationActionState {
  cooldownSeconds?: number;
  message?: string;
  redirectTo?: string;
  success: boolean;
}

export type ForgotPasswordFieldErrors = Partial<
  Record<keyof ForgotPasswordInput, string[]>
>;

export interface ForgotPasswordActionState {
  cooldownSeconds?: number;
  fieldErrors?: ForgotPasswordFieldErrors;
  message?: string;
  success: boolean;
}

export type ResetPasswordFieldErrors = Partial<
  Record<keyof ResetPasswordSubmissionInput, string[]>
>;

export interface ResetPasswordActionState {
  fieldErrors?: ResetPasswordFieldErrors;
  message?: string;
  redirectTo?: string;
  success: boolean;
}
