import Link from "next/link";
import { cache, Suspense } from "react";

import { formatCompactId, formatCurrency } from "@/components/account/account.utils";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import {
  AdminProductCreateSectionSkeleton,
  AdminProductDirectorySkeleton,
} from "@/components/shared/loading-skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryService } from "@/features/category/services/category.service";
import { AdminProductCreateForm } from "@/features/product/components/admin-product-create-form";
import { AdminProductDeleteButton } from "@/features/product/components/admin-product-delete-button";
import { productService } from "@/features/product/services/product.service";
import { cn } from "@/lib/utils";

interface AdminProductsPageProps {
  searchParams: Promise<{
    category?: string | string[] | undefined;
    page?: string | string[] | undefined;
    query?: string | string[] | undefined;
  }>;
}

interface AdminProductsSearchState {
  currentPage: number;
  searchQuery: string;
  selectedCategoryId: string;
}

const getFirstSearchParam = (
  value: string | string[] | undefined,
): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

const selectClassName =
  "flex h-10 w-full rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const getAdminCategories = cache(async () => {
  const result = await categoryService.getAll();

  return result.data;
});

const getAdminProducts = cache(
  async (
    selectedCategoryId: string,
    currentPage: number,
    searchQuery: string,
  ) => {
    const result = await productService.getAll({
      categoryId: selectedCategoryId || undefined,
      limit: 12,
      page: currentPage,
      search: searchQuery || undefined,
      sort: "created_desc",
    });

    return result.data;
  },
);

const buildProductsHref = ({
  currentPage,
  searchQuery,
  selectedCategoryId,
}: AdminProductsSearchState): string => {
  const nextSearchParams = new URLSearchParams();

  if (searchQuery) {
    nextSearchParams.set("query", searchQuery);
  }

  if (selectedCategoryId) {
    nextSearchParams.set("category", selectedCategoryId);
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
}: AdminProductsSearchState) {
  const productsPage = await getAdminProducts(
    selectedCategoryId,
    currentPage,
    searchQuery,
  );

  return (
    <Badge
      variant="secondary"
      className="h-auto rounded-full bg-white/10 px-4 py-2 text-white"
    >
      {productsPage.total} total products
    </Badge>
  );
}

async function AdminProductsCreateSection() {
  const categories = await getAdminCategories();

  return <AdminProductCreateForm categories={categories} />;
}

async function AdminProductsDirectory({
  currentPage,
  searchQuery,
  selectedCategoryId,
}: AdminProductsSearchState) {
  const [categories, productsPage] = await Promise.all([
    getAdminCategories(),
    getAdminProducts(selectedCategoryId, currentPage, searchQuery),
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
            Search and review catalog
          </h2>
        </div>

        <form className="flex flex-wrap items-center gap-3 rounded-xl border border-border/40 bg-muted/30 p-3">
          <Input
            name="query"
            defaultValue={searchQuery}
            placeholder="Search by name"
            className="min-w-40 flex-1 border-border/40 bg-card text-sm"
          />
          <select
            name="category"
            defaultValue={selectedCategoryId}
            className={cn(selectClassName, "w-44")}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm" className="rounded-full">
            Apply
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/admin/products">Clear</Link>
          </Button>
        </form>
      </div>

      <div className="mt-6 space-y-3">
        {products.length > 0 ? (
          products.map((product) => (
            <article
              key={product.id}
              className="rounded-xl border border-border/40 bg-muted/20 p-5 transition-all duration-200 hover:bg-muted/40"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold tracking-tight text-foreground">
                        {product.name}
                      </h3>
                      <Badge
                        variant={product.isActive ? "secondary" : "outline"}
                        className={
                          product.isActive
                            ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                            : undefined
                        }
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground/60">
                      {formatCompactId(product.id)}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg border border-border/30 bg-card px-3 py-2">
                      <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                        Price
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">
                        {formatCurrency(product.currentPrice)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/30 bg-card px-3 py-2">
                      <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                        Stock
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">
                        {product.stock}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/30 bg-card px-3 py-2">
                      <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                        Category
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">
                        {product.categoryName ?? "Uncategorized"}
                      </p>
                    </div>
                  </div>
                </div>

                <AdminProductDeleteButton
                  productId={product.id}
                  productName={product.name}
                />
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-5 py-10 text-center text-sm text-muted-foreground">
            No products matched. Adjust the search or create a new one above.
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
  const pageValue = Number.parseInt(
    getFirstSearchParam(resolvedSearchParams.page),
    10,
  );
  const currentPage = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;
  const searchState = {
    currentPage,
    searchQuery,
    selectedCategoryId,
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
