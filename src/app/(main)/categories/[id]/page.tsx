import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Layers } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/shared/pagination";
import { CategorySidebar } from "@/features/category/components/category-sidebar";
import { ProductGrid } from "@/features/product/components/product-grid";
import { ProductSortFilter } from "@/features/product/components/product-sort-filter";
import { categoryService } from "@/features/category/services/category.service";
import { productService } from "@/features/product/services/product.service";
import type { ProductQueryOptions } from "@/features/product/types/product.type";

interface CategoryPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    page?: string | string[];
    sort?: string | string[];
  }>;
}

const getParam = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;

  try {
    const categoriesResult = await categoryService.getAll();
    const category = categoriesResult.data.find(
      (cat) => cat.id === resolvedParams.id,
    );

    if (!category) {
      return {
        title: "Category Not Found — Steak Box",
      };
    }

    return {
      title: `${category.name} — Steak Box`,
      description:
        category.description ||
        `Browse ${category.name} products at Steak Box. Premium quality, delivered fresh.`,
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

  const categoryId = resolvedParams.id;
  const sortValue = getParam(resolvedSearchParams.sort);
  const pageValue = Number.parseInt(getParam(resolvedSearchParams.page), 10);
  const currentPage =
    Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;

  const queryOptions: ProductQueryOptions = {
    categoryId,
    limit: 12,
    page: currentPage,
    sort:
      (sortValue as ProductQueryOptions["sort"]) || "created_desc",
  };

  const [productsResult, categoriesResult] = await Promise.all([
    productService.getAll(queryOptions),
    categoryService.getAll(),
  ]);

  const products = productsResult.data;
  const categories = categoriesResult.data;
  const currentCategory = categories.find((cat) => cat.id === categoryId);

  if (!currentCategory) {
    notFound();
  }

  const paginationSearchParams: Record<string, string> = {};
  if (sortValue && sortValue !== "created_desc")
    paginationSearchParams.sort = sortValue;

  return (
    <div className="space-y-8">
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
            <Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-white backdrop-blur-sm">
              {products.total} product{products.total === 1 ? "" : "s"}
            </Badge>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="grid gap-8 xl:grid-cols-[240px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="hidden xl:block">
          <div className="animate-slide-in-left sticky top-24 space-y-4">
            <CategorySidebar
              categories={categories}
              activeCategoryId={categoryId}
            />
          </div>
        </aside>

        {/* Product listing */}
        <section className="animate-fade-in-up space-y-6" style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}>
          {/* Controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {products.items.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {products.total}
              </span>{" "}
              products
            </p>
            <Suspense>
              <ProductSortFilter basePath={`/categories/${categoryId}`} />
            </Suspense>
          </div>

          {/* Grid */}
          <ProductGrid
            products={products.items}
            emptyMessage="No products in this category yet."
          />

          {/* Pagination */}
          <div className="pt-6">
            <Pagination
              basePath={`/categories/${categoryId}`}
              currentPage={products.page}
              totalPages={products.totalPages}
              searchParams={paginationSearchParams}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
