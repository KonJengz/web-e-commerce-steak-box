import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/features/category/schemas/category.schema";
import type { Category } from "@/features/category/types/category.type";
import { api } from "@/lib/api/client";
import { PUBLIC_CATEGORIES_CACHE_TAG } from "@/lib/cache-tags";
import { encodeUrlSegment } from "@/lib/url-segment";
import type { ApiResult } from "@/types";

interface CategoryApiResponse {
  created_at: string;
  description: string | null;
  id: string;
  name: string;
  slug: string;
  updated_at: string;
}

interface DeleteCategoryApiResponse {
  message: string;
}

const mapCategory = (category: CategoryApiResponse): Category => {
  return {
    createdAt: category.created_at,
    description: category.description,
    id: category.id,
    name: category.name,
    slug: category.slug,
    updatedAt: category.updated_at,
  };
};

const getAll = async (): Promise<ApiResult<Category[]>> => {
  const result = await api.get<CategoryApiResponse[]>("/api/categories");

  return {
    ...result,
    data: result.data.map(mapCategory),
  };
};

const getPublicAll = async (): Promise<Category[]> => {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CATEGORIES_CACHE_TAG);

  const result = await api.get<CategoryApiResponse[]>("/api/categories");

  return result.data.map(mapCategory);
};

const getByIdentifier = async (
  identifier: string,
): Promise<ApiResult<Category>> => {
  const result = await api.get<CategoryApiResponse>(
    `/api/categories/${encodeUrlSegment(identifier)}`,
  );

  return {
    ...result,
    data: mapCategory(result.data),
  };
};

const getPublicByIdentifier = async (identifier: string): Promise<Category> => {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CATEGORIES_CACHE_TAG);

  const result = await api.get<CategoryApiResponse>(
    `/api/categories/${encodeUrlSegment(identifier)}`,
  );

  return mapCategory(result.data);
};

const create = async (
  accessToken: string,
  input: CreateCategoryInput,
): Promise<ApiResult<Category>> => {
  const result = await api.post<CategoryApiResponse>(
    "/api/categories",
    {
      description: input.description.trim(),
      name: input.name.trim(),
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return {
    ...result,
    data: mapCategory(result.data),
  };
};

const update = async (
  accessToken: string,
  categoryId: string,
  input: UpdateCategoryInput,
): Promise<ApiResult<Category>> => {
  const result = await api.put<CategoryApiResponse>(
    `/api/categories/${categoryId}`,
    {
      description: input.description.trim(),
      name: input.name.trim(),
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return {
    ...result,
    data: mapCategory(result.data),
  };
};

const remove = async (
  accessToken: string,
  categoryId: string,
): Promise<ApiResult<DeleteCategoryApiResponse>> => {
  return api.delete<DeleteCategoryApiResponse>(`/api/categories/${categoryId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const categoryService = {
  create,
  getAll,
  getByIdentifier,
  getPublicAll,
  getPublicByIdentifier,
  remove,
  update,
};
