import type { JSX } from "react";
import { Suspense, cache } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  type LucideIcon,
  Tags,
  TrendingUp,
} from "lucide-react";

import {
  formatAccountDateTime,
  formatCompactId,
  formatCurrency,
} from "@/components/account/account.utils";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import {
  AdminDashboardStatsSkeleton,
  AdminRecentInventorySkeleton,
} from "@/components/shared/loading-skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryService } from "@/features/category/services/category.service";
import type { Category } from "@/features/category/types/category.type";
import { productService } from "@/features/product/services/product.service";
import type { ProductSummary } from "@/features/product/types/product.type";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import { cn } from "@/lib/utils";

const LOW_STOCK_THRESHOLD = 5;
const RECENT_CATEGORY_LIMIT = 5;
const RECENT_PRODUCTS_LIMIT = 6;

interface DashboardMetric {
  hint: string;
  icon: LucideIcon;
  label: string;
  value: string;
}

interface DashboardSignal {
  hint: string;
  label: string;
  value: string;
}

interface AdminDashboardData {
  categories: Category[];
  inStockProducts: number;
  lastUpdatedAt: string | null;
  latestCategories: Category[];
  latestProducts: ProductSummary[];
  outOfStockProducts: number;
  recentCategorySpread: number;
  recentLowStockCount: number;
  recentUncategorizedCount: number;
  stockCoverage: number;
  totalProducts: number;
}

const getAdminDashboardData = cache(async (): Promise<AdminDashboardData> => {
  const [
    categoriesResult,
    recentProductsResult,
    totalProductsResult,
    inStockProductsResult,
  ] = await Promise.all([
    categoryService.getAll(),
    productService.getAll({
      limit: RECENT_PRODUCTS_LIMIT,
      page: 1,
      sort: "created_desc",
    }),
    productService.getAll({
      limit: 1,
      page: 1,
    }),
    productService.getAll({
      inStock: true,
      limit: 1,
      page: 1,
    }),
  ]);

  const categories = categoriesResult.data;
  const latestProducts = recentProductsResult.data.items;
  const totalProducts = totalProductsResult.data.total;
  const inStockProducts = inStockProductsResult.data.total;
  const outOfStockProducts = Math.max(totalProducts - inStockProducts, 0);
  const stockCoverage =
    totalProducts > 0 ? Math.round((inStockProducts / totalProducts) * 100) : 0;
  const recentLowStockCount = latestProducts.filter(
    (product) => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD,
  ).length;
  const recentUncategorizedCount = latestProducts.filter(
    (product) => !product.categoryName,
  ).length;
  const recentCategorySpread = new Set(
    latestProducts
      .map((product) => product.categoryId ?? product.categoryName)
      .filter((value): value is string => Boolean(value)),
  ).size;
  const latestCategories = [...categories]
    .sort((left, right) => {
      return (
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
      );
    })
    .slice(0, RECENT_CATEGORY_LIMIT);
  const lastUpdatedAt = [...latestProducts.map((product) => product.updatedAt), ...categories.map((category) => category.updatedAt)]
    .sort((left, right) => {
      return new Date(right).getTime() - new Date(left).getTime();
    })
    .at(0) ?? null;

  return {
    categories,
    inStockProducts,
    lastUpdatedAt,
    latestCategories,
    latestProducts,
    outOfStockProducts,
    recentCategorySpread,
    recentLowStockCount,
    recentUncategorizedCount,
    stockCoverage,
    totalProducts,
  };
});

const formatCount = (value: number): string => {
  return new Intl.NumberFormat("en-US").format(value);
};

const getProductInventoryHref = (product: ProductSummary): string => {
  const queryString = new URLSearchParams({
    query: product.name,
    view: "list",
  });

  return `/admin/products?${queryString.toString()}`;
};

const getProductInitial = (productName: string): string => {
  return productName.trim().charAt(0).toUpperCase() || "P";
};

function MetricStripItem({
  hint,
  icon: Icon,
  label,
  value,
}: DashboardMetric): JSX.Element {
  return (
    <article className="min-w-0 bg-background/98 px-5 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-2xl border border-border/60 bg-muted/20 text-primary">
          <Icon className="size-5" />
        </div>
      </div>
      <p className="mt-4 max-w-[22ch] text-[13px] leading-5 text-muted-foreground">
        {hint}
      </p>
    </article>
  );
}

function SignalRow({ hint, label, value }: DashboardSignal): JSX.Element {
  return (
    <article className="flex flex-col gap-3 rounded-[1.25rem] border border-border/60 bg-background/96 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs leading-5 text-muted-foreground">{hint}</p>
      </div>
      <p className="shrink-0 text-sm font-semibold tracking-tight text-foreground">
        {value}
      </p>
    </article>
  );
}

function ProductAvailabilityBadge({
  stock,
}: {
  stock: number;
}): JSX.Element {
  if (stock === 0) {
    return (
      <Badge
        variant="secondary"
        className="h-auto rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-rose-600 dark:text-rose-300"
      >
        Out of stock
      </Badge>
    );
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return (
      <Badge
        variant="secondary"
        className="h-auto rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-amber-700 dark:text-amber-300"
      >
        Low stock
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="h-auto rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300"
    >
      In stock
    </Badge>
  );
}

function ProductStatusBadge({
  isActive,
}: {
  isActive: boolean;
}): JSX.Element {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-auto rounded-full px-3 py-1",
        isActive
          ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border border-border/60 bg-muted/30 text-muted-foreground",
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

async function AdminDashboardHeroBadges(): Promise<JSX.Element> {
  const dashboardData = await getAdminDashboardData();

  return (
    <>
      <Badge
        variant="secondary"
        className="h-auto rounded-full bg-white/10 px-4 py-2 text-white"
      >
        {formatCount(dashboardData.totalProducts)} products tracked
      </Badge>
      <Badge
        variant="secondary"
        className="h-auto rounded-full bg-white/8 px-4 py-2 text-white/80"
      >
        {dashboardData.stockCoverage}% stocked · {formatCount(dashboardData.categories.length)} categories
      </Badge>
    </>
  );
}

async function AdminDashboardOperationsBoard(): Promise<JSX.Element> {
  const dashboardData = await getAdminDashboardData();

  const metrics = [
    {
      hint:
        dashboardData.totalProducts === 0
          ? "No products are in the catalog yet."
          : "Products currently tracked in the catalog.",
      icon: Boxes,
      label: "Products",
      value: formatCount(dashboardData.totalProducts),
    },
    {
      hint:
        dashboardData.inStockProducts === 0
          ? "Nothing is sellable right now."
          : "Products with sellable stock right now.",
      icon: TrendingUp,
      label: "In Stock",
      value: formatCount(dashboardData.inStockProducts),
    },
    {
      hint:
        dashboardData.outOfStockProducts === 0
          ? "No products need a restock pass."
          : "Products that need replenishment next.",
      icon: AlertTriangle,
      label: "Needs Restock",
      value: formatCount(dashboardData.outOfStockProducts),
    },
    {
      hint:
        dashboardData.categories.length === 0
          ? "Create the first category before scaling."
          : "Categories used for filters and merchandising.",
      icon: Tags,
      label: "Categories",
      value: formatCount(dashboardData.categories.length),
    },
  ] satisfies DashboardMetric[];

  const signals = [
    {
      hint: `Newest products with ${LOW_STOCK_THRESHOLD} units or fewer.`,
      label: "Recent low stock",
      value: formatCount(dashboardData.recentLowStockCount),
    },
    {
      hint: "Newest products that still need a category.",
      label: "Recent uncategorized",
      value: formatCount(dashboardData.recentUncategorizedCount),
    },
    {
      hint: `Distinct categories across the latest ${dashboardData.latestProducts.length || RECENT_PRODUCTS_LIMIT} products.`,
      label: "Recent category spread",
      value: formatCount(dashboardData.recentCategorySpread),
    },
  ] satisfies DashboardSignal[];

  return (
    <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.55fr)_360px]">
      <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
        <div className="border-b border-border/60 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-2">
              <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-muted-foreground">
                Catalog Pulse
              </p>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Inventory health and taxonomy in one surface
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  Read coverage first, then scan the latest issues that still
                  need attention.
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className="h-auto rounded-full px-3 py-1.5 text-xs"
            >
              {dashboardData.lastUpdatedAt
                ? `Last change ${formatAccountDateTime(dashboardData.lastUpdatedAt)}`
                : "Waiting for the first catalog record"}
            </Badge>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <div className="grid gap-px overflow-hidden rounded-[1.6rem] border border-border/60 bg-border/60 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <MetricStripItem key={metric.label} {...metric} />
            ))}
          </div>

          <div className="mt-6 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-[1.6rem] border border-border/60 bg-muted/15 p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-muted-foreground">
                    Stock Coverage
                  </p>
                  <p className="text-3xl font-semibold tracking-tight text-foreground">
                    {dashboardData.stockCoverage}%
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="h-auto rounded-full px-3 py-1 text-xs"
                >
                  {formatCount(dashboardData.inStockProducts)} / {formatCount(dashboardData.totalProducts)} stocked
                </Badge>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted/50">
                <div
                  className="h-full rounded-full bg-linear-to-r from-primary via-primary to-[#f6c168] transition-all duration-500"
                  style={{ width: `${dashboardData.stockCoverage}%` }}
                />
              </div>

              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {dashboardData.outOfStockProducts === 0
                  ? "Everything currently has stock."
                  : `${formatCount(dashboardData.outOfStockProducts)} products are out of stock right now.`}
              </p>
            </section>

            <section className="rounded-[1.6rem] border border-border/60 bg-background/96 p-5">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-muted-foreground">
                  Recent Signals
                </p>
                <p className="text-lg font-semibold tracking-tight text-foreground">
                  Latest batch watchlist
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {signals.map((signal) => (
                  <SignalRow key={signal.label} {...signal} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <aside className="relative overflow-hidden rounded-[2rem] border border-[#3f251d] bg-linear-to-b from-[#17100f] via-[#0f0908] to-[#090706] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 size-36 rounded-full bg-primary/18 blur-[85px]" />
          <div className="absolute bottom-0 left-0 size-40 rounded-full bg-[#f6c168]/10 blur-[100px]" />
        </div>

        <div className="relative space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-[#f6c168]">
              Action Rail
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Route the next admin move
            </h2>
            <p className="text-sm leading-7 text-white/65">
              Jump straight from monitoring into the next task.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/admin/products?view=list"
              className="group flex items-center justify-between rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-4 transition-colors hover:bg-white/10"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">
                  Review inventory list
                </p>
                <p className="text-xs leading-5 text-white/55">
                  Check stock, edits, and gallery changes.
                </p>
              </div>
              <ArrowRight className="size-4 text-[#f6c168] transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/admin/products"
              className="group flex items-center justify-between rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-4 transition-colors hover:bg-white/10"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">Add a new product</p>
                <p className="text-xs leading-5 text-white/55">
                  Start a new SKU with media and stock.
                </p>
              </div>
              <ArrowRight className="size-4 text-[#f6c168] transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/admin/categories"
              className="group flex items-center justify-between rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-4 transition-colors hover:bg-white/10"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">
                  Adjust category structure
                </p>
                <p className="text-xs leading-5 text-white/55">
                  Keep taxonomy and filters clean.
                </p>
              </div>
              <ArrowRight className="size-4 text-[#f6c168] transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
            <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-white/50">
              Freshness
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-white">
              {dashboardData.lastUpdatedAt
                ? formatAccountDateTime(dashboardData.lastUpdatedAt)
                : "Awaiting first update"}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Most recent change observed across products and categories.
            </p>
          </div>
        </div>
      </aside>
    </section>
  );
}

async function AdminDashboardWorkspace(): Promise<JSX.Element> {
  const dashboardData = await getAdminDashboardData();

  return (
    <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_340px]">
      <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-4 border-b border-border/60 px-6 py-6 lg:flex-row lg:items-end lg:justify-between sm:px-8">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-muted-foreground">
              Recent Inventory
            </p>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Newest catalog entries at a glance
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                Scan image, price, stock, and state before opening the full
                directory.
              </p>
            </div>
          </div>

          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link href="/admin/products?view=list">
              Open product directory
            </Link>
          </Button>
        </div>

        <div className="divide-y divide-border/60">
          {dashboardData.latestProducts.length > 0 ? (
            dashboardData.latestProducts.map((product) => (
              <article
                key={product.id}
                className="grid gap-5 px-6 py-5 transition-colors hover:bg-muted/10 sm:px-8 lg:grid-cols-[84px_minmax(0,1fr)_auto] lg:items-center"
              >
                <div className="relative aspect-square overflow-hidden rounded-[1.6rem] border border-border/60 bg-muted/20">
                  {product.imageUrl ? (
                    <Image
                      alt={product.name}
                      className="aspect-square object-cover"
                      fill
                      loader={cloudinaryLoader}
                      sizes="84px"
                      src={product.imageUrl}
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center bg-linear-to-br from-primary/10 via-muted/40 to-muted/20 text-xl font-semibold text-primary">
                      {getProductInitial(product.name)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 space-y-3">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-lg font-semibold tracking-tight text-foreground">
                        {product.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>{product.categoryName ?? "Uncategorized"}</span>
                        <span className="text-border">•</span>
                        <span>{formatCompactId(product.id)}</span>
                      </div>
                    </div>

                    <div className="space-y-1 xl:text-right">
                      <p className="text-lg font-semibold tracking-tight text-foreground">
                        {formatCurrency(product.currentPrice)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Updated {formatAccountDateTime(product.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <ProductStatusBadge isActive={product.isActive} />
                    <ProductAvailabilityBadge stock={product.stock} />
                    <Badge
                      variant="outline"
                      className="h-auto rounded-full px-3 py-1"
                    >
                      {product.stock} units
                    </Badge>
                  </div>
                </div>

                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href={getProductInventoryHref(product)}>Review</Link>
                </Button>
              </article>
            ))
          ) : (
            <div className="px-6 py-16 text-center sm:px-8">
              <p className="text-lg font-semibold tracking-tight text-foreground">
                No products have been added yet.
              </p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Create the first product, then the latest inventory will appear
                here automatically.
              </p>
              <Button asChild size="lg" className="mt-6 rounded-full">
                <Link href="/admin/products">Create the first product</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
          <div className="border-b border-border/60 px-6 py-5">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-muted-foreground">
                Taxonomy Watch
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Categories moving most recently
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                Keep taxonomy aligned before storefront filters drift.
              </p>
            </div>
          </div>

          <div className="p-6">
            {dashboardData.latestCategories.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.latestCategories.map((category) => (
                  <article
                    key={category.id}
                    className="rounded-[1.35rem] border border-border/60 bg-muted/15 px-4 py-3.5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {category.name}
                        </p>
                        <p className="text-xs leading-5 text-muted-foreground">
                          {category.description || "No description yet."}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="h-auto rounded-full px-2.5 py-1 text-[11px]"
                      >
                        {formatAccountDateTime(category.updatedAt)}
                      </Badge>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-border/60 bg-muted/15 px-4 py-8 text-center text-sm text-muted-foreground">
                No categories yet. Create the first one before scaling the catalog.
              </div>
            )}

            <div className="mt-5 rounded-[1.5rem] border border-border/60 bg-background/96 p-4">
              <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-muted-foreground">
                Structure Check
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[1.2rem] border border-border/60 bg-muted/15 px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Recent category spread
                  </p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                    {formatCount(dashboardData.recentCategorySpread)}
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-border/60 bg-muted/15 px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Recent uncategorized
                  </p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                    {formatCount(dashboardData.recentUncategorizedCount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </section>
  );
}

export default function AdminDashboardPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <AdminPageHero
        badge="Dashboard"
        title="Monitor catalog health and route the next admin action"
        description="Track coverage, review the newest inventory, and jump into the right management surface."
        variant="dashboard"
      >
        <Suspense
          fallback={
            <>
              <Badge
                variant="secondary"
                className="h-auto rounded-full bg-white/10 px-4 py-2 text-white"
              >
                Loading catalog stats
              </Badge>
              <Badge
                variant="secondary"
                className="h-auto rounded-full bg-white/8 px-4 py-2 text-white/80"
              >
                Preparing coverage view
              </Badge>
            </>
          }
        >
          <AdminDashboardHeroBadges />
        </Suspense>
      </AdminPageHero>

      <Suspense fallback={<AdminDashboardStatsSkeleton />}>
        <AdminDashboardOperationsBoard />
      </Suspense>

      <Suspense fallback={<AdminRecentInventorySkeleton />}>
        <AdminDashboardWorkspace />
      </Suspense>
    </div>
  );
}
