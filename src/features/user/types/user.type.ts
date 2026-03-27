export type UserRole = "ADMIN" | "USER";

export interface User {
  email: string;
  id: string;
  image: string | null;
  name: string;
  role: UserRole;
}

export interface UserProfile extends User {
  createdAt: string;
  isActive: boolean;
  isVerified: boolean;
}

export interface UpdateProfileActionState {
  fieldErrors?: {
    image?: string[];
    name?: string[];
    removeImage?: string[];
  };
  message?: string;
  profile?: UserProfile;
  requiresReauthentication?: boolean;
  success: boolean;
}

export interface RequestEmailChangeActionState {
  fieldErrors?: {
    email?: string[];
  };
  message?: string;
  pendingEmail?: string;
  requiresReauthentication?: boolean;
  success: boolean;
}

export interface VerifyEmailChangeActionState {
  fieldErrors?: {
    code?: string[];
    email?: string[];
  };
  message?: string;
  profile?: UserProfile;
  requiresReauthentication?: boolean;
  success: boolean;
}

export interface UpdatePasswordActionState {
  fieldErrors?: {
    confirmPassword?: string[];
    currentPassword?: string[];
    newPassword?: string[];
  };
  message?: string;
  redirectToLogin?: boolean;
  requiresReauthentication?: boolean;
  success: boolean;
}
