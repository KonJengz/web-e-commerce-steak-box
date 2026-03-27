import Link from "next/link";

import { formatCompactId, formatCurrency } from "@/components/account/account.utils";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const getFirstSearchParam = (
  value: string | string[] | undefined,
): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

const selectClassName =
  "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

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

  const [categoriesResult, productsResult] = await Promise.all([
    categoryService.getAll(),
    productService.getAll({
      categoryId: selectedCategoryId || undefined,
      limit: 12,
      page: currentPage,
      search: searchQuery || undefined,
      sort: "created_desc",
    }),
  ]);

  const categories = categoriesResult.data;
  const products = productsResult.data.items;
  const totalProducts = productsResult.data.total;
  const totalPages = productsResult.data.totalPages;
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const buildProductsHref = (page: number): string => {
    const nextSearchParams = new URLSearchParams();

    if (searchQuery) {
      nextSearchParams.set("query", searchQuery);
    }

    if (selectedCategoryId) {
      nextSearchParams.set("category", selectedCategoryId);
    }

    if (page > 1) {
      nextSearchParams.set("page", String(page));
    }

    const queryString = nextSearchParams.toString();

    return queryString ? `/admin/products?${queryString}` : "/admin/products";
  };

  return (
    <div className="space-y-6">
      <AdminPageHero
        badge="Catalog Admin"
        title="Manage live inventory without mixing it into the storefront shell"
        description="Products stay in a dedicated admin route tree. Filtering uses the public listing endpoint, while writes still go through protected admin APIs."
        variant="products"
      >
        <Badge
          variant="secondary"
          className="h-auto rounded-full bg-white/10 px-4 py-2 text-white"
        >
          {totalProducts} total products
        </Badge>
      </AdminPageHero>

      <AdminProductCreateForm categories={categories} />

      <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)] sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.28em] text-emerald-600 uppercase">
              Product Directory
            </p>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Search and review the catalog
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                The admin list only exposes capabilities the current API contract supports confidently.
              </p>
            </div>
          </div>

          <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
            <Input
              name="query"
              defaultValue={searchQuery}
              placeholder="Search by product name"
            />
            <select
              name="category"
              defaultValue={selectedCategoryId}
              className={cn(selectClassName)}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <Button type="submit" className="rounded-full">
              Apply
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/admin/products">Clear</Link>
            </Button>
          </form>
        </div>

        <div className="mt-8 space-y-4">
          {products.length > 0 ? (
            products.map((product) => (
              <article
                key={product.id}
                className="rounded-[1.5rem] border border-border/70 bg-background/60 p-5"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
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
                              ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                              : undefined
                          }
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ID {formatCompactId(product.id)}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[1.25rem] border border-border/70 bg-card/80 px-4 py-3">
                        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                          Price
                        </p>
                        <p className="mt-2 text-base font-semibold text-foreground">
                          {formatCurrency(product.currentPrice)}
                        </p>
                      </div>
                      <div className="rounded-[1.25rem] border border-border/70 bg-card/80 px-4 py-3">
                        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                          Stock
                        </p>
                        <p className="mt-2 text-base font-semibold text-foreground">
                          {product.stock}
                        </p>
                      </div>
                      <div className="rounded-[1.25rem] border border-border/70 bg-card/80 px-4 py-3">
                        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                          Category
                        </p>
                        <p className="mt-2 text-base font-semibold text-foreground">
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
            <div className="rounded-[1.5rem] border border-dashed border-border/70 bg-background/45 px-5 py-10 text-center text-sm leading-7 text-muted-foreground">
              No products matched this filter. Adjust the search or create a new one above.
            </div>
          )}
        </div>

        {totalPages > 1 ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-3">
              <Button
                asChild
                variant="outline"
                className="rounded-full"
                disabled={!hasPreviousPage}
              >
                <Link
                  href={hasPreviousPage ? buildProductsHref(currentPage - 1) : "#"}
                >
                  Previous
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full"
                disabled={!hasNextPage}
              >
                <Link href={hasNextPage ? buildProductsHref(currentPage + 1) : "#"}>
                  Next
                </Link>
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
