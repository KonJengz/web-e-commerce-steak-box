import Link from "next/link";
import { ArrowRight, Boxes, Tags } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <AdminPageHero
        badge="Admin Dashboard"
        title="Run the catalog from a dedicated admin surface"
        description="This area stays separate from customer account routes, but still uses the same service and validation patterns underneath."
        variant="dashboard"
      >
        <Button asChild className="rounded-full">
          <Link href="/admin/products">
            Manage Products
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
          <Link href="/admin/categories">Manage Categories</Link>
        </Button>
      </AdminPageHero>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.75rem] border border-border/70 bg-card/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-semibold tracking-[0.22em] text-emerald-600 uppercase">
            Total Products
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            {totalProducts}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Live catalog entries visible to the storefront.
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-border/70 bg-card/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-semibold tracking-[0.22em] text-emerald-600 uppercase">
            In Stock
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            {inStockProducts}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Products currently ready to be added to carts.
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-border/70 bg-card/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-semibold tracking-[0.22em] text-emerald-600 uppercase">
            Categories
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            {categories.length}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Available buckets for product assignment and filtering.
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-border/70 bg-card/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-semibold tracking-[0.22em] text-emerald-600 uppercase">
            API Surface
          </p>
          <p className="mt-3 text-lg font-semibold tracking-tight text-foreground">
            Products + Categories
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Orders and user administration stay out of this menu until backend admin endpoints exist.
          </p>
        </article>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.28em] text-emerald-600 uppercase">
                Recent Inventory
              </p>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Latest catalog entries
                </h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  Quick visibility into the newest products coming from the shared catalog API.
                </p>
              </div>
            </div>

            <Button asChild variant="outline" className="rounded-full">
              <Link href="/admin/products">Open Products</Link>
            </Button>
          </div>

          <div className="mt-8 space-y-3">
            {latestProducts.length > 0 ? (
              latestProducts.map((product) => (
                <article
                  key={product.id}
                  className="flex flex-col gap-4 rounded-[1.5rem] border border-border/70 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-foreground">
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
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>{formatCurrency(product.currentPrice)}</span>
                      <span>Stock {product.stock}</span>
                      <span>{product.categoryName ?? "Uncategorized"}</span>
                    </div>
                  </div>

                  <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                    {formatCompactId(product.id)}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-border/70 bg-background/45 px-5 py-8 text-sm leading-7 text-muted-foreground">
                No products are available yet. Start by creating the first catalog item.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)] sm:p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.28em] text-emerald-600 uppercase">
              Enabled Areas
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              What this admin can manage now
            </h2>
          </div>

          <div className="mt-8 space-y-4">
            <article className="rounded-[1.5rem] border border-border/70 bg-background/60 p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <Boxes className="size-5" />
                </span>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">
                    Product catalog
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    List, create, filter, and soft-delete products.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-[1.5rem] border border-border/70 bg-background/60 p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <Tags className="size-5" />
                </span>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">
                    Category setup
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Create catalog categories and keep taxonomy clean for storefront filters.
                  </p>
                </div>
              </div>
            </article>

            <div className="rounded-[1.5rem] border border-dashed border-border/70 bg-background/45 px-4 py-4 text-sm leading-7 text-muted-foreground">
              Admin order moderation and user management are intentionally left out until the backend exposes dedicated admin endpoints for them.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
