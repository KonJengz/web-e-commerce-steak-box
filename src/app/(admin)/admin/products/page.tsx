import Image from "next/image";
import Link from "next/link";
import { cache, Suspense } from "react";
import { Package, Sparkles } from "lucide-react";

import {
  formatAccountDateTime,
  formatCompactId,
  formatCurrency,
} from "@/components/account/account.utils";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import {
  AdminProductCreateSectionSkeleton,
  AdminProductDirectorySkeleton,
} from "@/components/shared/loading-skeletons";
import {
  adminHeroPrimaryBadgeClassName,
  adminInactiveBadgeClassName,
  adminOutlineBadgeClassName,
  adminSuccessBadgeClassName,
} from "@/components/ui/admin-badge-styles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryService } from "@/features/category/services/category.service";
import { AdminProductCreateForm } from "@/features/product/components/admin-product-create-form";
import { AdminProductDeleteButton } from "@/features/product/components/admin-product-delete-button";
import { AdminProductDirectoryFilters } from "@/features/product/components/admin-product-directory-filters";
import { AdminProductEditSheet } from "@/features/product/components/admin-product-edit-sheet";
import { productService } from "@/features/product/services/product.service";
import {
  DEFAULT_PRODUCT_DIRECTORY_VIEW,
  normalizeProductDirectoryView,
  type ProductDirectoryView,
} from "@/features/product/types/product-directory-view";
import {
  DEFAULT_PRODUCT_SORT,
  normalizeProductSort,
  type ProductSortValue,
} from "@/features/product/types/product-sort";
import type { ProductSummary } from "@/features/product/types/product.type";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import { cn } from "@/lib/utils";

interface AdminProductsPageProps {
  searchParams: Promise<{
    category?: string | string[] | undefined;
    page?: string | string[] | undefined;
    query?: string | string[] | undefined;
    sort?: string | string[] | undefined;
    view?: string | string[] | undefined;
  }>;
}

interface AdminProductsSearchState {
  currentPage: number;
  searchQuery: string;
  selectedCategoryId: string;
  sortValue: ProductSortValue;
  viewMode: ProductDirectoryView;
}

const getFirstSearchParam = (
  value: string | string[] | undefined,
): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

const getAdminCategories = cache(async () => {
  const result = await categoryService.getAll();

  return result.data;
});

const getAdminProducts = cache(
  async (
    selectedCategoryId: string,
    currentPage: number,
    searchQuery: string,
    sortValue: ProductSortValue,
  ) => {
    const result = await productService.getAll({
      categoryId: selectedCategoryId || undefined,
      limit: 12,
      page: currentPage,
      search: searchQuery || undefined,
      sort: sortValue,
    });

    return result.data;
  },
);

const buildProductsHref = ({
  currentPage,
  searchQuery,
  selectedCategoryId,
  sortValue,
  viewMode,
}: AdminProductsSearchState): string => {
  const nextSearchParams = new URLSearchParams();

  if (searchQuery) {
    nextSearchParams.set("query", searchQuery);
  }

  if (selectedCategoryId) {
    nextSearchParams.set("category", selectedCategoryId);
  }

  if (sortValue !== DEFAULT_PRODUCT_SORT) {
    nextSearchParams.set("sort", sortValue);
  }

  if (viewMode !== DEFAULT_PRODUCT_DIRECTORY_VIEW) {
    nextSearchParams.set("view", viewMode);
  }

  if (currentPage > 1) {
    nextSearchParams.set("page", String(currentPage));
  }

  const queryString = nextSearchParams.toString();

  return queryString ? `/admin/products?${queryString}` : "/admin/products";
};

async function AdminProductsHeroBadge({
  currentPage,
  searchQuery,
  selectedCategoryId,
  sortValue,
}: AdminProductsSearchState) {
  const productsPage = await getAdminProducts(
    selectedCategoryId,
    currentPage,
    searchQuery,
    sortValue,
  );

  return (
    <Badge
      variant="secondary"
      className={adminHeroPrimaryBadgeClassName}
    >
      {productsPage.total} total products
    </Badge>
  );
}

async function AdminProductsCreateSection() {
  const categories = await getAdminCategories();

  return <AdminProductCreateForm categories={categories} />;
}

function AdminProductPreviewImage({
  product,
  className,
  sizes,
}: {
  className: string;
  product: ProductSummary;
  sizes: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.5rem] border border-border/60 bg-linear-to-br from-muted/80 via-muted/45 to-muted/20",
        className,
      )}
    >
      {product.imageUrl ? (
        <Image
          loader={cloudinaryLoader}
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center">
            <Package className="mx-auto size-10 text-muted-foreground/28" />
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              No cover image
            </p>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/50 via-black/15 to-transparent px-4 py-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-background/82 px-3 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur-md">
          <Sparkles className="size-3.5 text-primary" />
          {product.imageUrl ? "Primary image" : "Add cover"}
        </div>
      </div>
    </div>
  );
}

function AdminProductActionGroup({
  categories,
  product,
}: {
  categories: Awaited<ReturnType<typeof getAdminCategories>>;
  product: ProductSummary;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row xl:flex-col xl:items-end">
      <AdminProductEditSheet categories={categories} product={product} />
      <AdminProductDeleteButton product={product} />
    </div>
  );
}

function AdminProductListItem({
  categories,
  product,
}: {
  categories: Awaited<ReturnType<typeof getAdminCategories>>;
  product: ProductSummary;
}) {
  return (
    <article className="group rounded-[1.75rem] border border-border/40 bg-muted/20 p-4 transition-all duration-200 hover:bg-muted/35">
      <div className="grid gap-5 xl:grid-cols-[13rem_minmax(0,1fr)_auto] xl:items-start">
        <AdminProductPreviewImage
          product={product}
          className="aspect-[4/3]"
          sizes="(max-width: 1280px) 100vw, 208px"
        />

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {product.name}
              </h3>
              <Badge
                variant={product.isActive ? "secondary" : "outline"}
                className={
                  product.isActive
                    ? adminSuccessBadgeClassName
                    : adminInactiveBadgeClassName
                }
              >
                {product.isActive ? "Active" : "Inactive"}
              </Badge>
              {product.categoryName ? (
                <Badge variant="outline" className={adminOutlineBadgeClassName}>
                  {product.categoryName}
                </Badge>
              ) : null}
            </div>

            <p className="font-mono text-xs text-muted-foreground/60">
              {formatCompactId(product.id)}
            </p>

            {product.description.trim() ? (
              <p className="max-w-3xl line-clamp-2 text-sm leading-6 text-muted-foreground">
                {product.description}
              </p>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground/75">
                No product description yet.
              </p>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-border/35 bg-card px-3 py-2.5">
              <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                Price
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {formatCurrency(product.currentPrice)}
              </p>
            </div>
            <div className="rounded-xl border border-border/35 bg-card px-3 py-2.5">
              <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                Stock
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {product.stock}
              </p>
            </div>
            <div className="rounded-xl border border-border/35 bg-card px-3 py-2.5">
              <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                Category
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {product.categoryName ?? "Uncategorized"}
              </p>
            </div>
            <div className="rounded-xl border border-border/35 bg-card px-3 py-2.5">
              <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                Updated
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {formatAccountDateTime(product.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        <AdminProductActionGroup categories={categories} product={product} />
      </div>
    </article>
  );
}

function AdminProductCardItem({
  categories,
  product,
}: {
  categories: Awaited<ReturnType<typeof getAdminCategories>>;
  product: ProductSummary;
}) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-border/45 bg-card/96 shadow-[0_18px_50px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,0.10)]">
      <AdminProductPreviewImage
        product={product}
        className="aspect-[4/3] rounded-none border-0"
        sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw"
      />

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-foreground">
              {product.name}
            </h3>
            <Badge
              variant={product.isActive ? "secondary" : "outline"}
              className={
                product.isActive
                  ? adminSuccessBadgeClassName
                  : adminInactiveBadgeClassName
              }
            >
              {product.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="font-mono text-xs text-muted-foreground/60">
            {formatCompactId(product.id)}
          </p>
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
            {product.description.trim() || "No product description yet."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border/35 bg-muted/25 px-3 py-2.5">
            <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
              Price
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {formatCurrency(product.currentPrice)}
            </p>
          </div>
          <div className="rounded-xl border border-border/35 bg-muted/25 px-3 py-2.5">
            <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
              Stock
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {product.stock}
            </p>
          </div>
          <div className="rounded-xl border border-border/35 bg-muted/25 px-3 py-2.5">
            <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
              Category
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {product.categoryName ?? "Uncategorized"}
            </p>
          </div>
          <div className="rounded-xl border border-border/35 bg-muted/25 px-3 py-2.5">
            <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
              Updated
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {formatAccountDateTime(product.updatedAt)}
            </p>
          </div>
        </div>

        <AdminProductActionGroup categories={categories} product={product} />
      </div>
    </article>
  );
}

async function AdminProductsDirectory({
  currentPage,
  searchQuery,
  selectedCategoryId,
  sortValue,
  viewMode,
}: AdminProductsSearchState) {
  const [categories, productsPage] = await Promise.all([
    getAdminCategories(),
    getAdminProducts(selectedCategoryId, currentPage, searchQuery, sortValue),
  ]);

  const products = productsPage.items;
  const totalPages = productsPage.totalPages;
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <section className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="glow-dot" />
            <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-muted-foreground">
              Product Directory
            </p>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Scan the catalog with image-first controls
          </h2>
        </div>

        <Suspense
          fallback={
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/40 bg-muted/30 p-3">
              <Skeleton className="h-10 min-w-40 flex-1" />
              <Skeleton className="h-10 w-44" />
              <Skeleton className="h-10 w-44" />
              <Skeleton className="h-10 w-38 rounded-full" />
              <Skeleton className="h-9 w-20 rounded-full" />
            </div>
          }
        >
          <AdminProductDirectoryFilters categories={categories} />
        </Suspense>
      </div>

      <div
        className={cn(
          "mt-6",
          viewMode === "card"
            ? "grid gap-4 md:grid-cols-2 2xl:grid-cols-3"
            : "space-y-3",
        )}
      >
        {products.length > 0 ? (
          products.map((product) =>
            viewMode === "card" ? (
              <AdminProductCardItem
                key={product.id}
                categories={categories}
                product={product}
              />
            ) : (
              <AdminProductListItem
                key={product.id}
                categories={categories}
                product={product}
              />
            ),
          )
        ) : (
          <div
            className={cn(
              "rounded-xl border border-dashed border-border/60 bg-muted/20 px-5 py-10 text-center text-sm text-muted-foreground",
              viewMode === "card" ? "md:col-span-2 2xl:col-span-3" : undefined,
            )}
          >
            No products matched. Adjust the filters or create a new one above.
          </div>
        )}
      </div>

      {totalPages > 1 ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={!hasPreviousPage}
            >
              <Link
                href={
                  hasPreviousPage
                    ? buildProductsHref({
                        currentPage: currentPage - 1,
                        searchQuery,
                        selectedCategoryId,
                        sortValue,
                        viewMode,
                      })
                    : "#"
                }
              >
                Previous
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={!hasNextPage}
            >
              <Link
                href={
                  hasNextPage
                    ? buildProductsHref({
                        currentPage: currentPage + 1,
                        searchQuery,
                        selectedCategoryId,
                        sortValue,
                        viewMode,
                      })
                    : "#"
                }
              >
                Next
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedCategoryId = getFirstSearchParam(resolvedSearchParams.category);
  const searchQuery = getFirstSearchParam(resolvedSearchParams.query);
  const sortValue = normalizeProductSort(
    getFirstSearchParam(resolvedSearchParams.sort),
  );
  const viewMode = normalizeProductDirectoryView(
    getFirstSearchParam(resolvedSearchParams.view),
  );
  const pageValue = Number.parseInt(
    getFirstSearchParam(resolvedSearchParams.page),
    10,
  );
  const currentPage = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;
  const searchState = {
    currentPage,
    searchQuery,
    selectedCategoryId,
    sortValue,
    viewMode,
  } satisfies AdminProductsSearchState;

  return (
    <div className="space-y-6">
      <AdminPageHero
        badge="Products"
        title="Manage your product catalog"
        description="Create, search, and manage products. Writes go through protected admin APIs."
        variant="products"
      >
        <Suspense
          fallback={
            <Badge
              variant="secondary"
              className="h-auto rounded-full bg-white/10 px-4 py-2 text-white"
            >
              <Skeleton className="h-5 w-28 bg-white/15" />
            </Badge>
          }
        >
          <AdminProductsHeroBadge {...searchState} />
        </Suspense>
      </AdminPageHero>

      <Suspense fallback={<AdminProductCreateSectionSkeleton />}>
        <AdminProductsCreateSection />
      </Suspense>

      <Suspense fallback={<AdminProductDirectorySkeleton />}>
        <AdminProductsDirectory {...searchState} />
      </Suspense>
    </div>
  );
}
