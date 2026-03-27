export interface Category {
  createdAt: string;
  description: string;
  id: string;
  name: string;
  updatedAt: string;
}

export interface CreateCategoryActionState {
  fieldErrors?: {
    description?: string[];
    name?: string[];
  };
  message?: string;
  requiresAdmin?: boolean;
  requiresReauthentication?: boolean;
  success: boolean;
}
