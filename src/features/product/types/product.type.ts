import type { PaginatedResponse } from "@/types";
import type { ProductSortValue } from "@/features/product/types/product-sort";

export interface ProductSummary {
  categoryId: string | null;
  categoryName: string | null;
  createdAt: string;
  currentPrice: string;
  description: string;
  id: string;
  imageUrl: string | null;
  isActive: boolean;
  name: string;
  stock: number;
  updatedAt: string;
}

export interface ProductDetail {
  categoryId: string | null;
  categoryName: string | null;
  createdAt: string;
  currentPrice: string;
  description: string;
  id: string;
  imageUrl: string | null;
  isActive: boolean;
  name: string;
  stock: number;
  updatedAt: string;
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
  sort?: ProductSortValue;
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

export interface UpdateProductActionState {
  fieldErrors?: {
    categoryId?: string[];
    coverImage?: string[];
    currentPrice?: string[];
    description?: string[];
    isActive?: string[];
    name?: string[];
    stock?: string[];
  };
  message?: string;
  requiresAdmin?: boolean;
  requiresReauthentication?: boolean;
  success: boolean;
}

export interface ProductGalleryActionState {
  fieldErrors?: {
    imageId?: string[];
    imageIds?: string[];
    images?: string[];
    productId?: string[];
  };
  images?: ProductImage[];
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
