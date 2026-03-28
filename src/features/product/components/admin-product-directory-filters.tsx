"use client";

import { LayoutGrid, Rows3 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import { Button } from "@/components/ui/button";
import {
  adminSurfaceInputClassName,
  adminSurfaceSelectClassName,
} from "@/components/ui/admin-control-styles";
import { adminOutlineButtonClassName } from "@/components/ui/admin-action-styles";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import type { Category } from "@/features/category/types/category.type";
import {
  DEFAULT_PRODUCT_DIRECTORY_VIEW,
  normalizeProductDirectoryView,
  PRODUCT_DIRECTORY_VIEW_OPTIONS,
} from "@/features/product/types/product-directory-view";
import {
  DEFAULT_PRODUCT_SORT,
  PRODUCT_SORT_OPTIONS,
  normalizeProductSort,
} from "@/features/product/types/product-sort";
import { cn } from "@/lib/utils";

interface AdminProductDirectoryFiltersProps {
  categories: Category[];
}

const SEARCH_DEBOUNCE_MS = 600;

export function AdminProductDirectoryFilters({
  categories,
}: AdminProductDirectoryFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams.get("query") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentSort = normalizeProductSort(
    searchParams.get("sort") ?? DEFAULT_PRODUCT_SORT,
  );
  const currentView = normalizeProductDirectoryView(
    searchParams.get("view") ?? DEFAULT_PRODUCT_DIRECTORY_VIEW,
  );
  const debounceTimerRef = useRef<number | null>(null);
  const lastSubmittedQueryRef = useRef(currentQuery);
  const lastSubmittedCategoryRef = useRef(currentCategory);
  const lastSubmittedSortRef = useRef(currentSort);
  const [query, setQuery] = useState(currentQuery);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [selectedSort, setSelectedSort] = useState(currentSort);

  const navigateWithFilters = useCallback(
    (
      nextValues: {
        category: string;
        query: string;
        sort: string;
        view: string;
      },
    ): void => {
      const nextParams = new URLSearchParams(searchParams.toString());
      const trimmedQuery = nextValues.query.trim();
      const normalizedSort = normalizeProductSort(nextValues.sort);
      const normalizedView = normalizeProductDirectoryView(nextValues.view);

      if (trimmedQuery) {
        nextParams.set("query", trimmedQuery);
      } else {
        nextParams.delete("query");
      }

      if (nextValues.category) {
        nextParams.set("category", nextValues.category);
      } else {
        nextParams.delete("category");
      }

      if (normalizedSort === DEFAULT_PRODUCT_SORT) {
        nextParams.delete("sort");
      } else {
        nextParams.set("sort", normalizedSort);
      }

      if (normalizedView === DEFAULT_PRODUCT_DIRECTORY_VIEW) {
        nextParams.delete("view");
      } else {
        nextParams.set("view", normalizedView);
      }

      nextParams.delete("page");

      const queryString = nextParams.toString();
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
      const currentUrl = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      if (nextUrl === currentUrl) {
        return;
      }

      lastSubmittedQueryRef.current = trimmedQuery;
      lastSubmittedCategoryRef.current = nextValues.category;
      lastSubmittedSortRef.current = normalizedSort;

      startTransition(() => {
        router.replace(nextUrl, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const previousSubmittedQuery = lastSubmittedQueryRef.current;
    const previousSubmittedCategory = lastSubmittedCategoryRef.current;
    const previousSubmittedSort = lastSubmittedSortRef.current;

    lastSubmittedQueryRef.current = currentQuery;
    lastSubmittedCategoryRef.current = currentCategory;
    lastSubmittedSortRef.current = currentSort;

    setQuery((previousQuery) => {
      return previousQuery.trim() === previousSubmittedQuery
        ? currentQuery
        : previousQuery;
    });
    setSelectedCategory((previousCategory) => {
      return previousCategory === previousSubmittedCategory
        ? currentCategory
        : previousCategory;
    });
    setSelectedSort((previousSort) => {
      return previousSort === previousSubmittedSort
        ? currentSort
        : previousSort;
    });
  }, [currentCategory, currentQuery, currentSort]);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery === currentQuery) {
      return;
    }

    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      navigateWithFilters({
        category: selectedCategory,
        query,
        sort: selectedSort,
        view: currentView,
      });
      debounceTimerRef.current = null;
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    currentQuery,
    currentView,
    navigateWithFilters,
    query,
    selectedCategory,
    selectedSort,
  ]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>): void => {
      event.preventDefault();

      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      navigateWithFilters({
        category: selectedCategory,
        query,
        sort: selectedSort,
        view: currentView,
      });
    },
    [currentView, navigateWithFilters, query, selectedCategory, selectedSort],
  );

  const handleClear = useCallback((): void => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setQuery("");
    setSelectedCategory("");
    setSelectedSort(DEFAULT_PRODUCT_SORT);
    lastSubmittedQueryRef.current = "";
    lastSubmittedCategoryRef.current = "";
    lastSubmittedSortRef.current = DEFAULT_PRODUCT_SORT;

    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }, [pathname, router]);

  const handleCategoryChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>): void => {
      const nextCategory = event.target.value;

      setSelectedCategory(nextCategory);

      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      navigateWithFilters({
        category: nextCategory,
        query,
        sort: selectedSort,
        view: currentView,
      });
    },
    [currentView, navigateWithFilters, query, selectedSort],
  );

  const handleSortChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>): void => {
      const nextSort = normalizeProductSort(event.target.value);

      setSelectedSort(nextSort);

      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      navigateWithFilters({
        category: selectedCategory,
        query,
        sort: nextSort,
        view: currentView,
      });
    },
    [currentView, navigateWithFilters, query, selectedCategory],
  );

  const handleViewChange = useCallback(
    (view: string): void => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      navigateWithFilters({
        category: selectedCategory,
        query,
        sort: selectedSort,
        view,
      });
    },
    [navigateWithFilters, query, selectedCategory, selectedSort],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-3 rounded-xl border border-border/40 bg-muted/30 p-3"
      aria-busy={isPending}
    >
      <Input
        name="query"
        value={query}
        placeholder="Search by name"
        className={cn(adminSurfaceInputClassName, "min-w-40 flex-1 bg-card")}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
      />

      <NativeSelect
        value={selectedCategory}
        onChange={handleCategoryChange}
        className={adminSurfaceSelectClassName}
        wrapperClassName="w-44"
        disabled={isPending}
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </NativeSelect>

      <NativeSelect
        value={selectedSort}
        onChange={handleSortChange}
        className={adminSurfaceSelectClassName}
        wrapperClassName="w-44"
        disabled={isPending}
      >
        {PRODUCT_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </NativeSelect>

      <div className="inline-flex items-center rounded-full border border-border/60 bg-card/85 p-1">
        {PRODUCT_DIRECTORY_VIEW_OPTIONS.map((option) => {
          const isActive = currentView === option.value;
          const Icon = option.value === "card" ? LayoutGrid : Rows3;

          return (
            <button
              key={option.value}
              type="button"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              aria-pressed={isActive}
              disabled={isPending}
              onClick={() => handleViewChange(option.value)}
            >
              <Icon className="size-3.5" />
              {option.label}
            </button>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        className={cn(adminOutlineButtonClassName, "h-10")}
        disabled={isPending}
        onClick={handleClear}
      >
        Clear
      </Button>
    </form>
  );
}
