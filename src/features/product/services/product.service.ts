import "server-only";

import type { CreateProductInput } from "@/features/product/schemas/product.schema";
import type {
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
  remove,
};
