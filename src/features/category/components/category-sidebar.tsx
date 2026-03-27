import Link from "next/link";
import { LayoutGrid } from "lucide-react";

import type { Category } from "@/features/category/types/category.type";
import { cn } from "@/lib/utils";

interface CategorySidebarProps {
  activeCategoryId?: string | null;
  categories: Category[];
}

export function CategorySidebar({
  activeCategoryId = null,
  categories,
}: CategorySidebarProps) {
  return (
    <nav
      aria-label="Product categories"
      className="gradient-border rounded-2xl border border-border/40 bg-card p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LayoutGrid className="size-4" />
        </span>
        <h2 className="text-sm font-semibold text-foreground">Categories</h2>
      </div>

      <div className="space-y-0.5">
        <Link
          href="/"
          className={cn(
            "flex items-center rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
            !activeCategoryId
              ? "bg-primary/10 text-primary shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          All Products
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.id}`}
            className={cn(
              "flex items-center rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
              activeCategoryId === category.id
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
