import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Layers } from "lucide-react";
import { notFound, permanentRedirect } from "next/navigation";
import { cache, Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { CatalogResultsPanelSkeleton } from "@/components/shared/loading-skeletons";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { CategorySidebar } from "@/features/category/components/category-sidebar";
import { buildCategoryPath } from "@/features/category/utils/category-path";
import { ProductGrid } from "@/features/product/components/product-grid";
import { ProductSortFilter } from "@/features/product/components/product-sort-filter";
import { JsonLd } from "@/components/shared/json-ld";
import { categoryService } from "@/features/category/services/category.service";
import { productService } from "@/features/product/services/product.service";
import type { ProductQueryOptions } from "@/features/product/types/product.type";
import {
  DEFAULT_PRODUCT_SORT,
  normalizeProductSort,
} from "@/features/product/types/product-sort";
import { buildAbsoluteSiteUrl } from "@/lib/metadata";
import { normalizeUrlSegment } from "@/lib/url-segment";

interface CategoryPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    page?: string | string[];
    search?: string | string[];
    sort?: string | string[];
  }>;
}

const getParam = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

const getAllCategories = cache(async () => {
  return (await categoryService.getPublicAll()).data;
});

const getCategory = cache(async (identifier: string) => {
  return (await categoryService.getPublicByIdentifier(identifier)).data;
});

const getCategoryProducts = cache(
  async (
    categorySlug: string,
    currentPage: number,
    searchValue: string,
    sortValue: ProductQueryOptions["sort"],
  ) => {
    return (
      await productService.getPublicAll({
        categorySlug,
        limit: 12,
        page: currentPage,
        search: searchValue || undefined,
        sort: sortValue,
      })
    ).data;
  },
);

interface CategoryProductCountBadgeProps {
  categorySlug: string;
  currentPage: number;
  searchValue: string;
  sortValue: ProductQueryOptions["sort"];
}

async function CategoryProductCountBadge({
  categorySlug,
  currentPage,
  searchValue,
  sortValue,
}: CategoryProductCountBadgeProps) {
  const products = await getCategoryProducts(
    categorySlug,
    currentPage,
    searchValue,
    sortValue,
  );

  return (
    <Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-white backdrop-blur-sm">
      {products.total} product{products.total === 1 ? "" : "s"}
    </Badge>
  );
}

interface CategoryResultsSummaryProps {
  categorySlug: string;
  currentPage: number;
  searchValue: string;
  sortValue: ProductQueryOptions["sort"];
}

async function CategoryResultsSummary({
  categorySlug,
  currentPage,
  searchValue,
  sortValue,
}: CategoryResultsSummaryProps) {
  const products = await getCategoryProducts(
    categorySlug,
    currentPage,
    searchValue,
    sortValue,
  );

  return (
    <p className="text-sm text-muted-foreground">
      Showing{" "}
      <span className="font-medium text-foreground">{products.items.length}</span>{" "}
      of <span className="font-medium text-foreground">{products.total}</span>{" "}
      products
      {searchValue ? (
        <>
          {" "}
          for &ldquo;
          <span className="font-medium text-foreground">{searchValue}</span>
          &rdquo;
        </>
      ) : null}
    </p>
  );
}

interface CategoryResultsListProps {
  categorySlug: string;
  currentPage: number;
  searchValue: string;
  sortValue: ProductQueryOptions["sort"];
}

async function CategoryResultsList({
  categorySlug,
  currentPage,
  searchValue,
  sortValue,
}: CategoryResultsListProps) {
  const products = await getCategoryProducts(
    categorySlug,
    currentPage,
    searchValue,
    sortValue,
  );
  const paginationSearchParams: Record<string, string> = {};

  if (searchValue) {
    paginationSearchParams.search = searchValue;
  }

  if (sortValue && sortValue !== DEFAULT_PRODUCT_SORT) {
    paginationSearchParams.sort = sortValue;
  }

  return (
    <>
      <ProductGrid
        products={products.items}
        emptyMessage={
          searchValue
            ? `No products found for "${searchValue}" in this category.`
            : "No products in this category yet."
        }
      />

      <div className="pt-6">
        <Pagination
          basePath={buildCategoryPath(categorySlug)}
          currentPage={products.page}
          totalPages={products.totalPages}
          searchParams={paginationSearchParams}
        />
      </div>
    </>
  );
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const requestedIdentifier = normalizeUrlSegment(resolvedParams.id);

  try {
    const category = await getCategory(requestedIdentifier);

    return {
      alternates: {
        canonical: buildCategoryPath(category.slug),
      },
      title: `${category.name} — Steak Box`,
      description:
        category.description ||
        `Browse ${category.name} products at Steak Box. Premium quality, delivered fresh.`,
      openGraph: {
        description:
          category.description ||
          `Browse ${category.name} products at Steak Box. Premium quality, delivered fresh.`,
        title: `${category.name} — Steak Box`,
        url: buildCategoryPath(category.slug),
      },
    };
  } catch {
    return {
      title: "Category — Steak Box",
    };
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const requestedIdentifier = normalizeUrlSegment(resolvedParams.id);
  const searchValue = getParam(resolvedSearchParams.search);
  const sortValue = normalizeProductSort(getParam(resolvedSearchParams.sort));
  const pageValue = Number.parseInt(getParam(resolvedSearchParams.page), 10);
  const currentPage =
    Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;
  const categories = await getAllCategories();
  let currentCategory;

  try {
    currentCategory = await getCategory(requestedIdentifier);
  } catch {
    notFound();
  }

  if (requestedIdentifier !== currentCategory.slug) {
    permanentRedirect(buildCategoryPath(currentCategory.slug));
  }

  const resultsKey = `${currentCategory.slug}:${currentPage}:${searchValue}:${sortValue}`;

  return (
    <div className="space-y-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Products",
              item: buildAbsoluteSiteUrl("/"),
            },
            {
              "@type": "ListItem",
              position: 2,
              name: currentCategory.name,
              item: buildAbsoluteSiteUrl(buildCategoryPath(currentCategory.slug)),
            },
          ],
        }}
      />
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="animate-fade-in flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link href="/" className="transition-colors hover:text-foreground">
          Products
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">
          {currentCategory.name}
        </span>
      </nav>

      {/* Hero */}
      <section className="animate-fade-in relative overflow-hidden rounded-3xl border border-white/6 bg-linear-to-br from-[#1a0f0d] via-[#0f0908] to-[#0a0706] px-6 py-8 text-white shadow-2xl sm:px-10 sm:py-10">
        {/* Animated orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float absolute -top-16 -right-16 size-56 rounded-full bg-primary/15 blur-[90px]" />
          <div className="animate-float-delayed absolute -bottom-24 -left-16 size-64 rounded-full bg-[#f6c168]/8 blur-[100px]" />
          <div className="animate-float-slow absolute top-10 right-[15%] opacity-30">
            <Layers className="size-10 text-primary/30" />
          </div>
        </div>

        <div className="relative space-y-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-[11px] font-semibold tracking-[0.24em] uppercase text-[#f6c168] backdrop-blur-sm">
            <div className="glow-dot" />
            Category
          </div>

          <div className="space-y-3">
            <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {currentCategory.name}
            </h1>
            {currentCategory.description ? (
              <p className="max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
                {currentCategory.description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Suspense
              fallback={
                <Skeleton className="h-8 w-28 rounded-full bg-white/12" />
              }
            >
              <CategoryProductCountBadge
                categorySlug={currentCategory.slug}
                currentPage={currentPage}
                searchValue={searchValue}
                sortValue={sortValue}
              />
            </Suspense>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden xl:block">
          <div className="animate-slide-in-left sticky top-24 space-y-4">
            <CategorySidebar
              categories={categories}
              activeCategorySlug={currentCategory.slug}
            />
          </div>
        </aside>

        <section
          className="animate-fade-in-up space-y-6"
          style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Suspense
              key={`${resultsKey}:summary`}
              fallback={<Skeleton className="h-5 w-52" />}
            >
              <CategoryResultsSummary
                categorySlug={currentCategory.slug}
                currentPage={currentPage}
                searchValue={searchValue}
                sortValue={sortValue}
              />
            </Suspense>
            <Suspense>
              <ProductSortFilter basePath={buildCategoryPath(currentCategory.slug)} />
            </Suspense>
          </div>

          <Suspense
            key={`${resultsKey}:results`}
            fallback={<CatalogResultsPanelSkeleton />}
          >
            <CategoryResultsList
              categorySlug={currentCategory.slug}
              currentPage={currentPage}
              searchValue={searchValue}
              sortValue={sortValue}
            />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
