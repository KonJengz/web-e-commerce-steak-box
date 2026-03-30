import type { Metadata } from "next";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { adminHeroPrimaryBadgeClassName } from "@/components/ui/admin-badge-styles";
import { Badge } from "@/components/ui/badge";
import { AdminCategoryCard } from "@/features/category/components/admin-category-card";
import { AdminCategoryCreateForm } from "@/features/category/components/admin-category-create-form";
import { AdminCategoryDirectoryFilters } from "@/features/category/components/admin-category-directory-filters";
import { categoryService } from "@/features/category/services/category.service";
import {
  DEFAULT_CATEGORY_DIRECTORY_SORT,
  DEFAULT_CATEGORY_USAGE_FILTER,
  normalizeCategoryDirectorySort,
  normalizeCategoryUsageFilter,
  type CategoryDirectorySortValue,
  type CategoryUsageFilterValue,
} from "@/features/category/types/category-directory-query";
import type { Category } from "@/features/category/types/category.type";
import { productService } from "@/features/product/services/product.service";
import { BASE_PRIVATE_METADATA } from "@/lib/metadata";

export const metadata: Metadata = {
  ...BASE_PRIVATE_METADATA,
  title: "Taxonomy Management",
};

interface AdminCategoryDirectoryItem {
  assignedProductCount: number;
  category: Category;
}

interface AdminCategoriesPageProps {
  searchParams: Promise<{
    query?: string | string[] | undefined;
    sort?: string | string[] | undefined;
    status?: string | string[] | undefined;
  }>;
}

const getSearchParamValue = (
  value: string | string[] | undefined,
): string | null => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return null;
};

const sortDirectoryItems = (
  items: AdminCategoryDirectoryItem[],
  sort: CategoryDirectorySortValue,
): AdminCategoryDirectoryItem[] => {
  return [...items].sort((leftItem, rightItem) => {
    const leftName = leftItem.category.name;
    const rightName = rightItem.category.name;
    const leftUpdatedAt = new Date(leftItem.category.updatedAt).getTime();
    const rightUpdatedAt = new Date(rightItem.category.updatedAt).getTime();

    switch (sort) {
      case "assigned_asc":
        return (
          leftItem.assignedProductCount - rightItem.assignedProductCount ||
          leftName.localeCompare(rightName)
        );
      case "assigned_desc":
        return (
          rightItem.assignedProductCount - leftItem.assignedProductCount ||
          leftName.localeCompare(rightName)
        );
      case "name_asc":
        return leftName.localeCompare(rightName);
      case "name_desc":
        return rightName.localeCompare(leftName);
      case "updated_desc":
      default:
        return rightUpdatedAt - leftUpdatedAt || leftName.localeCompare(rightName);
    }
  });
};

const filterDirectoryItems = (
  items: AdminCategoryDirectoryItem[],
  {
    query,
    status,
  }: {
    query: string;
    status: CategoryUsageFilterValue;
  },
): AdminCategoryDirectoryItem[] => {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return items.filter(({ assignedProductCount, category }) => {
    const matchesQuery =
      !normalizedQuery ||
      category.name.toLocaleLowerCase().includes(normalizedQuery) ||
      (category.description ?? "").toLocaleLowerCase().includes(normalizedQuery);

    if (!matchesQuery) {
      return false;
    }

    if (status === "in_use") {
      return assignedProductCount > 0;
    }

    if (status === "unused") {
      return assignedProductCount === 0;
    }

    return true;
  });
};

export default async function AdminCategoriesPage({
  searchParams,
}: AdminCategoriesPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = getSearchParamValue(resolvedSearchParams.query) ?? "";
  const sort = normalizeCategoryDirectorySort(
    getSearchParamValue(resolvedSearchParams.sort) ??
      DEFAULT_CATEGORY_DIRECTORY_SORT,
  );
  const status = normalizeCategoryUsageFilter(
    getSearchParamValue(resolvedSearchParams.status) ??
      DEFAULT_CATEGORY_USAGE_FILTER,
  );
  const result = await categoryService.getAll();
  const categories = result.data;
  const categoryDirectoryItems = await Promise.all(
    categories.map(async (category): Promise<AdminCategoryDirectoryItem> => {
      const productsResult = await productService.getAll({
        categoryId: category.id,
        limit: 1,
        page: 1,
      });

      return {
        assignedProductCount: productsResult.data.total,
        category,
      };
    }),
  );
  const filteredCategoryDirectoryItems = sortDirectoryItems(
    filterDirectoryItems(categoryDirectoryItems, { query, status }),
    sort,
  );
  const hasActiveFilters =
    query.trim().length > 0 ||
    sort !== DEFAULT_CATEGORY_DIRECTORY_SORT ||
    status !== DEFAULT_CATEGORY_USAGE_FILTER;

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
          className={adminHeroPrimaryBadgeClassName}
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
          <p className="text-sm text-muted-foreground">
            Search fast, surface unused taxonomy, and sort by assignment load.
          </p>
        </div>

        <div className="mt-6">
          <AdminCategoryDirectoryFilters
            filteredCount={filteredCategoryDirectoryItems.length}
            totalCount={categoryDirectoryItems.length}
          />
        </div>

        <div className="stagger-children mt-6 grid gap-3 xl:grid-cols-2">
          {filteredCategoryDirectoryItems.length > 0 ? (
            filteredCategoryDirectoryItems.map(
              ({ assignedProductCount, category }) => (
              <AdminCategoryCard
                key={category.id}
                assignedProductCount={assignedProductCount}
                category={category}
              />
              ),
            )
          ) : categoryDirectoryItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-5 py-10 text-center text-sm text-muted-foreground xl:col-span-2">
              No categories exist yet. Create the first one above.
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-5 py-10 text-center text-sm text-muted-foreground xl:col-span-2">
              {hasActiveFilters
                ? "No categories match the current search or filter. Adjust the directory controls above."
                : "No categories are available right now."}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
