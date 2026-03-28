import "server-only";

import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/features/category/schemas/category.schema";
import type { Category } from "@/features/category/types/category.type";
import { api } from "@/lib/api/client";
import type { ApiResult } from "@/types";

interface CategoryApiResponse {
  created_at: string;
  description: string;
  id: string;
  name: string;
  updated_at: string;
}

const mapCategory = (category: CategoryApiResponse): Category => {
  return {
    createdAt: category.created_at,
    description: category.description,
    id: category.id,
    name: category.name,
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

export const categoryService = {
  create,
  getAll,
  update,
};
