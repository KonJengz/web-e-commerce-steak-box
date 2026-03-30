import "server-only";

import type {
  CreateProductCoreInput,
  UpdateProductCoreInput,
} from "@/features/product/schemas/product.schema";
import type {
  ProductDetail,
  ProductImage,
  ProductListResult,
  ProductQueryOptions,
  ProductSummary,
  ProductUploadedImage,
} from "@/features/product/types/product.type";
import { api } from "@/lib/api/client";
import { PUBLIC_PRODUCTS_CACHE_TAG } from "@/lib/cache-tags";
import { encodeUrlSegment } from "@/lib/url-segment";
import type { ApiResult } from "@/types";

interface ProductListItemApiResponse {
  category_id: string | null;
  category_name: string | null;
  category_slug?: string | null;
  created_at: string;
  current_price: string;
  description: string;
  id: string;
  image_url: string | null;
  is_active: boolean;
  name: string;
  slug: string;
  stock: number;
  updated_at: string;
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
  category_slug?: string | null;
  created_at: string;
  current_price: string;
  description: string;
  id: string;
  image_url: string | null;
  is_active: boolean;
  name: string;
  slug: string;
  stock: number;
  updated_at: string;
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

interface ProductUploadImageApiResponse {
  image_public_id: string;
  image_url: string;
}

interface ProductImagesMutationApiResponse {
  images: ProductImageApiResponse[];
}

const PUBLIC_PRODUCT_FETCH_OPTIONS = {
  cache: "force-cache" as const,
  next: {
    revalidate: 300,
    tags: [PUBLIC_PRODUCTS_CACHE_TAG],
  },
};

const mapProductSummary = (
  product: ProductListItemApiResponse,
): ProductSummary => {
  return {
    categoryId: product.category_id,
    categoryName: product.category_name,
    categorySlug: product.category_slug ?? null,
    createdAt: product.created_at,
    currentPrice: product.current_price,
    description: product.description,
    id: product.id,
    imageUrl: product.image_url,
    isActive: product.is_active,
    name: product.name,
    slug: product.slug,
    stock: product.stock,
    updatedAt: product.updated_at,
  };
};

const mapProductDetail = (
  product: ProductDetailApiResponse,
): ProductDetail => {
  return {
    categoryId: product.category_id,
    categoryName: product.category_name,
    categorySlug: product.category_slug ?? null,
    createdAt: product.created_at,
    currentPrice: product.current_price,
    description: product.description,
    id: product.id,
    imageUrl: product.image_url,
    isActive: product.is_active,
    name: product.name,
    slug: product.slug,
    stock: product.stock,
    updatedAt: product.updated_at,
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

const mapUploadedProductImage = (
  image: ProductUploadImageApiResponse,
): ProductUploadedImage => {
  return {
    imagePublicId: image.image_public_id,
    imageUrl: image.image_url,
  };
};

const mapProductImages = (
  images: ProductImageApiResponse[],
): ProductImage[] => {
  return images.map(mapProductImage);
};

const buildProductListPath = (options: ProductQueryOptions = {}): string => {
  const searchParams = new URLSearchParams();

  if (options.categoryId) {
    searchParams.set("category_id", options.categoryId);
  }

  if (options.categorySlug) {
    searchParams.set("category_slug", options.categorySlug);
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
  const result = await api.get<ProductListApiResponse>(
    buildProductListPath(options),
  );

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

const getPublicAll = async (
  options: ProductQueryOptions = {},
): Promise<ApiResult<ProductListResult>> => {
  const result = await api.get<ProductListApiResponse>(
    buildProductListPath(options),
    PUBLIC_PRODUCT_FETCH_OPTIONS,
  );

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

const getByIdentifier = async (
  identifier: string,
): Promise<ApiResult<ProductDetail>> => {
  const result = await api.get<ProductDetailApiResponse>(
    `/api/products/${encodeUrlSegment(identifier)}`,
  );

  return {
    ...result,
    data: mapProductDetail(result.data),
  };
};

const getPublicByIdentifier = async (
  identifier: string,
): Promise<ApiResult<ProductDetail>> => {
  const result = await api.get<ProductDetailApiResponse>(
    `/api/products/${encodeUrlSegment(identifier)}`,
    PUBLIC_PRODUCT_FETCH_OPTIONS,
  );

  return {
    ...result,
    data: mapProductDetail(result.data),
  };
};

const getImages = async (
  identifier: string,
): Promise<ApiResult<ProductImage[]>> => {
  const result = await api.get<ProductImageApiResponse[]>(
    `/api/products/${encodeUrlSegment(identifier)}/images`,
  );

  return {
    ...result,
    data: result.data.map(mapProductImage),
  };
};

const getPublicImages = async (
  identifier: string,
): Promise<ApiResult<ProductImage[]>> => {
  const result = await api.get<ProductImageApiResponse[]>(
    `/api/products/${encodeUrlSegment(identifier)}/images`,
    PUBLIC_PRODUCT_FETCH_OPTIONS,
  );

  return {
    ...result,
    data: result.data.map(mapProductImage),
  };
};

const create = async (
  accessToken: string,
  input: CreateProductCoreInput,
  primaryImage?: ProductUploadedImage,
): Promise<ApiResult<ProductMutationApiResponse>> => {
  return api.post<ProductMutationApiResponse>(
    "/api/products",
    {
      category_id: input.categoryId,
      current_price: input.currentPrice,
      description: input.description.trim(),
      image_public_id: primaryImage?.imagePublicId,
      image_url: primaryImage?.imageUrl,
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

const update = async (
  accessToken: string,
  productId: string,
  input: UpdateProductCoreInput,
  primaryImage?: ProductUploadedImage,
): Promise<ApiResult<ProductDetail>> => {
  const result = await api.put<ProductDetailApiResponse>(
    `/api/products/${productId}`,
    {
      category_id: input.categoryId || undefined,
      current_price: input.currentPrice,
      description: input.description.trim(),
      image_public_id: primaryImage?.imagePublicId,
      image_url: primaryImage?.imageUrl,
      is_active: input.isActive === "active",
      name: input.name.trim(),
      stock: input.stock,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return {
    ...result,
    data: mapProductDetail(result.data),
  };
};

const uploadImage = async (
  accessToken: string,
  image: File,
): Promise<ApiResult<ProductUploadedImage>> => {
  const formData = new FormData();

  formData.set("image", image);

  const result = await api.post<ProductUploadImageApiResponse>(
    "/api/products/upload-image",
    formData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return {
    ...result,
    data: mapUploadedProductImage(result.data),
  };
};

const addImage = async (
  accessToken: string,
  productId: string,
  image: ProductUploadedImage,
  options?: {
    isPrimary?: boolean;
  },
): Promise<ApiResult<ProductImage[]>> => {
  const result = await api.post<ProductImagesMutationApiResponse>(
    `/api/products/${productId}/images`,
    {
      image_public_id: image.imagePublicId,
      image_url: image.imageUrl,
      is_primary: options?.isPrimary ?? false,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return {
    ...result,
    data: mapProductImages(result.data.images),
  };
};

const reorderImages = async (
  accessToken: string,
  productId: string,
  imageIds: string[],
): Promise<ApiResult<null>> => {
  return api.put<null>(
    `/api/products/${productId}/images/reorder`,
    {
      image_ids: imageIds,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
};

const removeImage = async (
  accessToken: string,
  productId: string,
  imageId: string,
): Promise<ApiResult<null>> => {
  return api.delete<null>(`/api/products/${productId}/images/${imageId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
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
  addImage,
  create,
  getAll,
  getByIdentifier,
  getImages,
  getPublicAll,
  getPublicByIdentifier,
  getPublicImages,
  remove,
  removeImage,
  reorderImages,
  update,
  uploadImage,
};
