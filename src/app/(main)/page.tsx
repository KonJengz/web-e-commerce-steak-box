import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Flame, Sparkles, Beef } from "lucide-react";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { HeaderSearch } from "@/components/layout/header/header-search";
import { CatalogContentSkeleton } from "@/components/shared/loading-skeletons";
import { Pagination } from "@/components/shared/pagination";
import { CategorySidebar } from "@/features/category/components/category-sidebar";
import { ProductGrid } from "@/features/product/components/product-grid";
import { ProductSortFilter } from "@/features/product/components/product-sort-filter";
import { categoryService } from "@/features/category/services/category.service";
import { productService } from "@/features/product/services/product.service";
import type { ProductQueryOptions } from "@/features/product/types/product.type";

export const metadata: Metadata = {
  title: "Premium Steaks & Cuts — Steak Box",
  description:
    "Browse our curated selection of premium steaks and cuts. Fresh, certified, and delivered to your door.",
};

interface HomePageProps {
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

interface HomeCatalogSectionProps {
  searchParams: HomePageProps["searchParams"];
}

async function HomeCatalogSection({
  searchParams,
}: HomeCatalogSectionProps) {
  const resolvedParams = await searchParams;
  const searchQuery = getParam(resolvedParams.search);
  const sortValue = getParam(resolvedParams.sort);
  const pageValue = Number.parseInt(getParam(resolvedParams.page), 10);
  const currentPage =
    Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;

  const queryOptions: ProductQueryOptions = {
    inStock: undefined,
    limit: 12,
    page: currentPage,
    search: searchQuery || undefined,
    sort:
      (sortValue as ProductQueryOptions["sort"]) || "created_desc",
  };

  const [productsResult, categoriesResult] = await Promise.all([
    productService.getAll(queryOptions),
    categoryService.getAll(),
  ]);

  const products = productsResult.data;
  const categories = categoriesResult.data;

  const paginationSearchParams: Record<string, string> = {};
  if (searchQuery) paginationSearchParams.search = searchQuery;
  if (sortValue && sortValue !== "created_desc")
    paginationSearchParams.sort = sortValue;

  return (
    <>
      {categories.length > 0 ? (
        <section className="animate-fade-in-up mb-10 space-y-4" style={{ animationDelay: "0.5s", animationFillMode: "backwards" }}>
          <div className="flex items-center gap-3">
            <div className="glow-dot" />
            <h2 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
              Shop by Category
            </h2>
          </div>
          <div className="stagger-children flex flex-wrap gap-2.5">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="hover-lift inline-flex items-center gap-1.5 rounded-2xl border border-border/60 bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
              >
                {category.name}
                <ChevronRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden xl:block">
          <div className="animate-slide-in-left sticky top-24 space-y-4">
            <CategorySidebar categories={categories} />
          </div>
        </aside>

        <section className="animate-fade-in-up space-y-6" style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
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
                {searchQuery ? (
                  <>
                    {" "}
                    for &ldquo;
                    <span className="font-medium text-foreground">
                      {searchQuery}
                    </span>
                    &rdquo;
                  </>
                ) : null}
              </p>
            </div>
            <Suspense>
              <ProductSortFilter basePath="/" />
            </Suspense>
          </div>

          <ProductGrid
            products={products.items}
            emptyMessage={
              searchQuery
                ? `No products found for "${searchQuery}"`
                : "No products available yet"
            }
          />

          <div className="pt-6">
            <Pagination
              basePath="/"
              currentPage={products.page}
              totalPages={products.totalPages}
              searchParams={paginationSearchParams}
            />
          </div>
        </section>
      </div>
    </>
  );
}

export default function HomePage({ searchParams }: HomePageProps) {
  return (
    <>
      {/* Mobile search */}
      <div className="my-4 sm:hidden">
        <HeaderSearch />
      </div>

      {/* Hero */}
      <section className="animate-fade-in relative mb-10 overflow-hidden rounded-3xl border border-white/6 bg-linear-to-br from-[#1a0f0d] via-[#0f0908] to-[#0a0706] px-6 py-10 text-white shadow-2xl sm:px-10 sm:py-16 lg:py-20">
        {/* Animated gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float absolute -top-20 -right-20 size-72 rounded-full bg-primary/20 blur-[100px]" />
          <div className="animate-float-delayed absolute -bottom-32 -left-20 size-80 rounded-full bg-[#f6c168]/10 blur-[120px]" />
          <div className="animate-pulse-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-primary/6 blur-[80px]" />
          {/* Floating decorative dots */}
          <div className="animate-float-slow absolute top-16 right-[20%]">
            <div className="glow-dot" />
          </div>
          <div className="animate-bounce-subtle absolute bottom-20 left-[15%]">
            <div className="glow-dot" />
          </div>
          <div className="animate-float absolute top-[40%] right-[10%] opacity-40">
            <Beef className="size-16 text-primary/20" />
          </div>
        </div>

        {/* Grid pattern overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative space-y-6 lg:max-w-3xl">
          <div className="animate-fade-in-up inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-[11px] font-semibold tracking-[0.24em] uppercase text-[#f6c168] backdrop-blur-sm" style={{ animationDelay: "0.1s" }}>
            <Flame className="size-3.5 animate-wiggle" />
            Fresh Cuts Daily
          </div>

          <div className="space-y-5">
            <h1 className="animate-fade-in-up text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}>
              Premium Steaks,{" "}
              <span className="gradient-text">Delivered Fresh.</span>
            </h1>
            <p className="animate-fade-in-up max-w-xl text-base leading-7 text-white/55 sm:text-lg" style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}>
              Hand-picked cuts from certified farms. Browse our collection,
              build your box, and have it delivered right to your kitchen.
            </p>
          </div>

          <div className="animate-fade-in-up flex flex-wrap gap-3 pt-1" style={{ animationDelay: "0.4s", animationFillMode: "backwards" }}>
            <Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-white backdrop-blur-sm">
              Chef-selected premium cuts
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full border-[#f6c168]/20 bg-[#f6c168]/6 px-3 py-1.5 text-[#f6c168] backdrop-blur-sm"
            >
              <Sparkles className="mr-1 size-3" />
              Free delivery over ฿2,000
            </Badge>
          </div>
        </div>
      </section>

      <Suspense fallback={<CatalogContentSkeleton />}>
        <HomeCatalogSection searchParams={searchParams} />
      </Suspense>
    </>
  );
}
