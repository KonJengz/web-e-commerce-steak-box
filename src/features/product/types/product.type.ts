import type { PaginatedResponse } from "@/types";

export interface ProductSummary {
  categoryId: string | null;
  categoryName: string | null;
  currentPrice: string;
  id: string;
  isActive: boolean;
  name: string;
  stock: number;
}

export interface ProductDetail {
  categoryId: string | null;
  categoryName: string | null;
  createdAt: string;
  currentPrice: string;
  description: string;
  id: string;
  imagePublicId: string | null;
  imageUrl: string | null;
  isActive: boolean;
  name: string;
  stock: number;
}

export interface ProductImage {
  createdAt: string;
  id: string;
  imagePublicId: string;
  imageUrl: string;
  isPrimary: boolean;
  productId: string;
  sortOrder: number;
}

export interface ProductUploadedImage {
  imagePublicId: string;
  imageUrl: string;
}

export interface ProductQueryOptions {
  categoryId?: string;
  inStock?: boolean;
  limit?: number;
  maxPrice?: number;
  minPrice?: number;
  page?: number;
  search?: string;
  sort?: "created_asc" | "created_desc" | "price_asc" | "price_desc";
}

export interface CreateProductActionState {
  fieldErrors?: {
    categoryId?: string[];
    currentPrice?: string[];
    description?: string[];
    images?: string[];
    name?: string[];
    stock?: string[];
  };
  message?: string;
  requiresAdmin?: boolean;
  requiresReauthentication?: boolean;
  success: boolean;
  warning?: boolean;
}

export interface DeleteProductActionState {
  message?: string;
  requiresAdmin?: boolean;
  requiresReauthentication?: boolean;
  success: boolean;
}

export type ProductListResult = PaginatedResponse<ProductSummary>;
