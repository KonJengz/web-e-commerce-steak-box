import "server-only";

import type { CreateProductInput } from "@/features/product/schemas/product.schema";
import type {
  ProductDetail,
  ProductImage,
  ProductListResult,
  ProductQueryOptions,
  ProductSummary,
} from "@/features/product/types/product.type";
import { api } from "@/lib/api/client";
import type { ApiResult } from "@/types";

interface ProductListItemApiResponse {
  category_id: string | null;
  category_name: string | null;
  current_price: string;
  id: string;
  is_active: boolean;
  name: string;
  stock: number;
}

interface ProductListApiResponse {
  data: ProductListItemApiResponse[];
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

interface ProductDetailApiResponse {
  category_id: string | null;
  category_name: string | null;
  created_at: string;
  current_price: string;
  description: string;
  id: string;
  image_public_id: string | null;
  image_url: string | null;
  is_active: boolean;
  name: string;
  stock: number;
}

interface ProductImageApiResponse {
  created_at: string;
  id: string;
  image_public_id: string;
  image_url: string;
  is_primary: boolean;
  product_id: string;
  sort_order: number;
}

interface ProductMutationApiResponse {
  id: string;
}

const mapProductSummary = (
  product: ProductListItemApiResponse,
): ProductSummary => {
  return {
    categoryId: product.category_id,
    categoryName: product.category_name,
    currentPrice: product.current_price,
    id: product.id,
    isActive: product.is_active,
    name: product.name,
    stock: product.stock,
  };
};

const mapProductDetail = (
  product: ProductDetailApiResponse,
): ProductDetail => {
  return {
    categoryId: product.category_id,
    categoryName: product.category_name,
    createdAt: product.created_at,
    currentPrice: product.current_price,
    description: product.description,
    id: product.id,
    imagePublicId: product.image_public_id,
    imageUrl: product.image_url,
    isActive: product.is_active,
    name: product.name,
    stock: product.stock,
  };
};

const mapProductImage = (
  image: ProductImageApiResponse,
): ProductImage => {
  return {
    createdAt: image.created_at,
    id: image.id,
    imagePublicId: image.image_public_id,
    imageUrl: image.image_url,
    isPrimary: image.is_primary,
    productId: image.product_id,
    sortOrder: image.sort_order,
  };
};

const buildProductListPath = (options: ProductQueryOptions = {}): string => {
  const searchParams = new URLSearchParams();

  if (options.categoryId) {
    searchParams.set("category_id", options.categoryId);
  }

  if (typeof options.inStock === "boolean") {
    searchParams.set("in_stock", String(options.inStock));
  }

  if (typeof options.limit === "number") {
    searchParams.set("limit", String(options.limit));
  }

  if (typeof options.maxPrice === "number") {
    searchParams.set("max_price", String(options.maxPrice));
  }

  if (typeof options.minPrice === "number") {
    searchParams.set("min_price", String(options.minPrice));
  }

  if (typeof options.page === "number") {
    searchParams.set("page", String(options.page));
  }

  if (options.search) {
    searchParams.set("search", options.search);
  }

  if (options.sort) {
    searchParams.set("sort", options.sort);
  }

  const queryString = searchParams.toString();

  return queryString ? `/api/products?${queryString}` : "/api/products";
};

const getAll = async (
  options: ProductQueryOptions = {},
): Promise<ApiResult<ProductListResult>> => {
  const result = await api.get<ProductListApiResponse>(buildProductListPath(options));

  return {
    ...result,
    data: {
      items: result.data.data.map(mapProductSummary),
      limit: result.data.limit,
      page: result.data.page,
      total: result.data.total,
      totalPages: result.data.total_pages,
    },
  };
};

const getById = async (
  productId: string,
): Promise<ApiResult<ProductDetail>> => {
  const result = await api.get<ProductDetailApiResponse>(
    `/api/products/${productId}`,
  );

  return {
    ...result,
    data: mapProductDetail(result.data),
  };
};

const getImages = async (
  productId: string,
): Promise<ApiResult<ProductImage[]>> => {
  const result = await api.get<ProductImageApiResponse[]>(
    `/api/products/${productId}/images`,
  );

  return {
    ...result,
    data: result.data.map(mapProductImage),
  };
};

const create = async (
  accessToken: string,
  input: CreateProductInput,
): Promise<ApiResult<ProductMutationApiResponse>> => {
  return api.post<ProductMutationApiResponse>(
    "/api/products",
    {
      category_id: input.categoryId,
      current_price: input.currentPrice,
      description: input.description.trim(),
      name: input.name.trim(),
      stock: input.stock,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
};

const remove = async (
  accessToken: string,
  productId: string,
): Promise<ApiResult<null>> => {
  return api.delete<null>(`/api/products/${productId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const productService = {
  create,
  getAll,
  getById,
  getImages,
  remove,
};
