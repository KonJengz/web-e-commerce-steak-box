import { formatAccountDate } from "@/components/account/account.utils";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { Badge } from "@/components/ui/badge";
import { AdminCategoryCreateForm } from "@/features/category/components/admin-category-create-form";
import { categoryService } from "@/features/category/services/category.service";

export default async function AdminCategoriesPage() {
  const result = await categoryService.getAll();
  const categories = result.data;

  return (
    <div className="space-y-6">
      <AdminPageHero
        badge="Categories"
        title="Manage product taxonomy"
        description="Create and organize categories for storefront filtering."
        variant="categories"
      >
        <Badge
          variant="secondary"
          className="h-auto rounded-full bg-white/10 px-4 py-2 text-white"
        >
          {categories.length} total categories
        </Badge>
      </AdminPageHero>

      <AdminCategoryCreateForm />

      <section className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="glow-dot" />
            <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-muted-foreground">
              Category Directory
            </p>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Current categories
          </h2>
        </div>

        <div className="stagger-children mt-6 grid gap-3 xl:grid-cols-2">
          {categories.length > 0 ? (
            categories.map((category) => (
              <article
                key={category.id}
                className="hover-lift rounded-xl border border-border/40 bg-muted/20 p-5 transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                      {category.name}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {formatAccountDate(category.createdAt)}
                    </Badge>
                  </div>

                  {category.description ? (
                    <p className="text-sm leading-6 text-muted-foreground">
                      {category.description}
                    </p>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-5 py-10 text-center text-sm text-muted-foreground xl:col-span-2">
              No categories exist yet. Create the first one above.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
