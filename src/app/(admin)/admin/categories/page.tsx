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
        badge="Taxonomy Admin"
        title="Keep category structure explicit before products rely on it"
        description="Categories are managed in a dedicated admin route so product assignment and storefront filtering stay consistent over time."
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

      <section className="rounded-[2rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,251,249,0.95))] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)] sm:p-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.28em] text-emerald-600 uppercase">
            Category Directory
          </p>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Current catalog categories
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              The current backend docs expose category creation. Update and delete controls can land here later without changing navigation.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          {categories.length > 0 ? (
            categories.map((category) => (
              <article
                key={category.id}
                className="rounded-[1.5rem] border border-emerald-500/10 bg-background/60 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.03)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                      {category.name}
                    </h3>
                    <Badge variant="outline">
                      Created {formatAccountDate(category.createdAt)}
                    </Badge>
                  </div>

                  <p className="text-sm leading-7 text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-border/70 bg-background/45 px-5 py-10 text-center text-sm leading-7 text-muted-foreground xl:col-span-2">
              No categories exist yet. Create the first one above before adding products.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
