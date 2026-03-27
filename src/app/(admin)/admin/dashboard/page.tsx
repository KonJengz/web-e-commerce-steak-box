import Link from "next/link";
import { ArrowRight, Boxes, Tags, TrendingUp, Package, Activity } from "lucide-react";

import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryService } from "@/features/category/services/category.service";
import { productService } from "@/features/product/services/product.service";
import { formatCompactId, formatCurrency } from "@/components/account/account.utils";

export default async function AdminDashboardPage() {
  const [categoriesResult, latestProductsResult, productCountResult, inStockResult] =
    await Promise.all([
      categoryService.getAll(),
      productService.getAll({
        limit: 5,
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
  const latestProducts = latestProductsResult.data.items;
  const totalProducts = productCountResult.data.total;
  const inStockProducts = inStockResult.data.total;

  const stats = [
    {
      icon: Package,
      label: "Total Products",
      value: totalProducts,
      description: "Live catalog entries",
    },
    {
      icon: TrendingUp,
      label: "In Stock",
      value: inStockProducts,
      description: "Ready to purchase",
    },
    {
      icon: Tags,
      label: "Categories",
      value: categories.length,
      description: "Active taxonomy buckets",
    },
    {
      icon: Activity,
      label: "API Surface",
      value: "2",
      description: "Products + Categories",
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHero
        badge="Dashboard"
        title="Overview of your catalog"
        description="Quick stats and recent entries from your inventory."
        variant="dashboard"
      >
        <Button asChild className="rounded-full">
          <Link href="/admin/products">
            Manage Products
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
        >
          <Link href="/admin/categories">Manage Categories</Link>
        </Button>
      </AdminPageHero>

      {/* Stats grid */}
      <section className="stagger-children grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="hover-lift group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 shadow-sm"
            >
              <div className="pointer-events-none absolute -right-6 -bottom-6 size-24 rounded-full bg-primary/5 blur-[40px] transition-transform duration-500 group-hover:scale-150" />
              <div className="relative">
                <div className="mb-3 inline-flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        {/* Recent products */}
        <section className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="glow-dot" />
                <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-muted-foreground">
                  Recent Inventory
                </p>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Latest entries
              </h2>
            </div>

            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/admin/products">View All</Link>
            </Button>
          </div>

          <div className="mt-6 space-y-2">
            {latestProducts.length > 0 ? (
              latestProducts.map((product) => (
                <article
                  key={product.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/40 bg-muted/30 p-4 transition-all duration-200 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {product.name}
                      </p>
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
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>{formatCurrency(product.currentPrice)}</span>
                      <span>Stock: {product.stock}</span>
                      <span>{product.categoryName ?? "Uncategorized"}</span>
                    </div>
                  </div>

                  <p className="font-mono text-[11px] text-muted-foreground/60">
                    {formatCompactId(product.id)}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-5 py-8 text-center text-sm text-muted-foreground">
                No products yet. Start by creating the first catalog item.
              </div>
            )}
          </div>
        </section>

        {/* Quick links */}
        <section className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-muted-foreground">
              Quick Actions
            </p>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              What you can manage
            </h2>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href="/admin/products"
              className="hover-lift flex items-center gap-4 rounded-2xl border border-border/40 bg-muted/30 p-4 transition-all duration-200 hover:border-primary/20 hover:bg-muted/50"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Boxes className="size-5" />
              </span>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  Product catalog
                </p>
                <p className="text-xs text-muted-foreground">
                  Create, filter, and manage products
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>

            <Link
              href="/admin/categories"
              className="hover-lift flex items-center gap-4 rounded-2xl border border-border/40 bg-muted/30 p-4 transition-all duration-200 hover:border-primary/20 hover:bg-muted/50"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Tags className="size-5" />
              </span>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  Category setup
                </p>
                <p className="text-xs text-muted-foreground">
                  Create and organize taxonomy
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>

            <div className="rounded-2xl border border-dashed border-border/50 bg-muted/15 px-4 py-3 text-xs text-muted-foreground">
              Orders and user admin will appear here when backend endpoints are ready.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
