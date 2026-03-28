export interface Category {
  createdAt: string;
  description: string;
  id: string;
  name: string;
  updatedAt: string;
}

export interface CategoryFieldErrors {
  description?: string[];
  name?: string[];
}

export interface CreateCategoryActionState {
  fieldErrors?: CategoryFieldErrors;
  message?: string;
  requiresAdmin?: boolean;
  requiresReauthentication?: boolean;
  success: boolean;
}

export interface UpdateCategoryActionState {
  fieldErrors?: CategoryFieldErrors;
  message?: string;
  requiresAdmin?: boolean;
  requiresReauthentication?: boolean;
  success: boolean;
}
