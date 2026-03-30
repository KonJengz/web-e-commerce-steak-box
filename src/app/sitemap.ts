import type { MetadataRoute } from "next";

import { categoryService } from "@/features/category/services/category.service";
import { buildCategoryPath } from "@/features/category/utils/category-path";
import { productService } from "@/features/product/services/product.service";
import type { ProductSummary } from "@/features/product/types/product.type";
import { buildProductPath } from "@/features/product/utils/product-path";
import { buildAbsoluteSiteUrl } from "@/lib/metadata";

const SITEMAP_PRODUCT_PAGE_LIMIT = 100;

const getAllPublicProducts = async (): Promise<ProductSummary[]> => {
  const products: ProductSummary[] = [];
  let currentPage = 1;
  let totalPages = 1;

  do {
    const response = await productService.getPublicAll({
      limit: SITEMAP_PRODUCT_PAGE_LIMIT,
      page: currentPage,
    });

    products.push(...response.data.items.filter((product) => product.isActive));
    totalPages = response.data.totalPages;
    currentPage += 1;
  } while (currentPage <= totalPages);

  return products;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    categoryService.getPublicAll(),
    getAllPublicProducts(),
  ]);

  return [
    {
      changeFrequency: "daily",
      lastModified: new Date(),
      priority: 1,
      url: buildAbsoluteSiteUrl("/"),
    },
    ...categories.data.map((category) => ({
      changeFrequency: "weekly" as const,
      lastModified: category.updatedAt,
      priority: 0.7,
      url: buildAbsoluteSiteUrl(buildCategoryPath(category.slug)),
    })),
    ...products.map((product) => ({
      changeFrequency: "weekly" as const,
      lastModified: product.updatedAt,
      priority: 0.8,
      url: buildAbsoluteSiteUrl(buildProductPath(product.slug)),
    })),
  ];
}
