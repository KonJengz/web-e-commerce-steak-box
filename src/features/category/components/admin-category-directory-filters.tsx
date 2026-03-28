"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CATEGORY_DIRECTORY_SORT_OPTIONS,
  CATEGORY_USAGE_FILTER_OPTIONS,
  DEFAULT_CATEGORY_DIRECTORY_SORT,
  DEFAULT_CATEGORY_USAGE_FILTER,
  normalizeCategoryDirectorySort,
  normalizeCategoryUsageFilter,
} from "@/features/category/types/category-directory-query";
import { cn } from "@/lib/utils";

interface AdminCategoryDirectoryFiltersProps {
  filteredCount: number;
  totalCount: number;
}

const SEARCH_DEBOUNCE_MS = 450;

const selectClassName =
  "flex h-10 w-full rounded-xl border border-border/50 bg-background/80 px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AdminCategoryDirectoryFilters({
  filteredCount,
  totalCount,
}: AdminCategoryDirectoryFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams.get("query") ?? "";
  const currentStatus = normalizeCategoryUsageFilter(
    searchParams.get("status") ?? DEFAULT_CATEGORY_USAGE_FILTER,
  );
  const currentSort = normalizeCategoryDirectorySort(
    searchParams.get("sort") ?? DEFAULT_CATEGORY_DIRECTORY_SORT,
  );

  const [query, setQuery] = useState<string>(currentQuery);
  const [selectedSort, setSelectedSort] =
    useState<typeof currentSort>(currentSort);
  const debounceTimerRef = useRef<number | null>(null);
  const lastSubmittedQueryRef = useRef<string>(currentQuery);
  const lastSubmittedSortRef = useRef<typeof currentSort>(currentSort);

  const navigateWithFilters = useCallback(
    ({
      nextQuery,
      nextSort,
      nextStatus,
    }: {
      nextQuery: string;
      nextSort: string;
      nextStatus: string;
    }): void => {
      const nextParams = new URLSearchParams(searchParams.toString());
      const trimmedQuery = nextQuery.trim();
      const normalizedSort = normalizeCategoryDirectorySort(nextSort);
      const normalizedStatus = normalizeCategoryUsageFilter(nextStatus);

      if (trimmedQuery) {
        nextParams.set("query", trimmedQuery);
      } else {
        nextParams.delete("query");
      }

      if (normalizedStatus === DEFAULT_CATEGORY_USAGE_FILTER) {
        nextParams.delete("status");
      } else {
        nextParams.set("status", normalizedStatus);
      }

      if (normalizedSort === DEFAULT_CATEGORY_DIRECTORY_SORT) {
        nextParams.delete("sort");
      } else {
        nextParams.set("sort", normalizedSort);
      }

      const queryString = nextParams.toString();
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
      const currentUrl = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      if (nextUrl === currentUrl) {
        return;
      }

      lastSubmittedQueryRef.current = trimmedQuery;
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
    const previousSubmittedSort = lastSubmittedSortRef.current;

    lastSubmittedQueryRef.current = currentQuery;
    lastSubmittedSortRef.current = currentSort;

    setQuery((previousQuery) => {
      return previousQuery.trim() === previousSubmittedQuery
        ? currentQuery
        : previousQuery;
    });

    setSelectedSort((previousSort) => {
      return previousSort === previousSubmittedSort
        ? currentSort
        : previousSort;
    });
  }, [currentQuery, currentSort]);

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
        nextQuery: query,
        nextSort: selectedSort,
        nextStatus: currentStatus,
      });
      debounceTimerRef.current = null;
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentQuery, currentStatus, navigateWithFilters, query, selectedSort]);

  const handleClear = useCallback((): void => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setQuery("");
    setSelectedSort(DEFAULT_CATEGORY_DIRECTORY_SORT);
    lastSubmittedQueryRef.current = "";
    lastSubmittedSortRef.current = DEFAULT_CATEGORY_DIRECTORY_SORT;

    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }, [pathname, router]);

  const handleSortChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>): void => {
      const nextSort = normalizeCategoryDirectorySort(event.target.value);

      setSelectedSort(nextSort);

      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      navigateWithFilters({
        nextQuery: query,
        nextSort,
        nextStatus: currentStatus,
      });
    },
    [currentStatus, navigateWithFilters, query],
  );

  const handleStatusChange = useCallback(
    (nextStatus: string): void => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      navigateWithFilters({
        nextQuery: query,
        nextSort: selectedSort,
        nextStatus,
      });
    },
    [navigateWithFilters, query, selectedSort],
  );

  const hasActiveFilters =
    Boolean(currentQuery) ||
    currentStatus !== DEFAULT_CATEGORY_USAGE_FILTER ||
    currentSort !== DEFAULT_CATEGORY_DIRECTORY_SORT;

  return (
    <div
      className="rounded-[1.4rem] border border-border/50 bg-muted/20 p-4"
      aria-busy={isPending}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <label className="relative block min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="query"
              value={query}
              placeholder="Search category name or description"
              className="h-11 border-border/50 bg-background/80 pl-10"
              onChange={(event) => {
                setQuery(event.target.value);
              }}
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/85 p-1">
              {CATEGORY_USAGE_FILTER_OPTIONS.map((option) => {
                const isActive = currentStatus === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
                      isActive
                        ? "bg-foreground text-background shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    aria-pressed={isActive}
                    disabled={isPending}
                    onClick={() => {
                      handleStatusChange(option.value);
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full min-w-44 sm:w-52">
                <SlidersHorizontal className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={selectedSort}
                  onChange={handleSortChange}
                  className={cn(selectClassName, "h-11 pl-10")}
                  disabled={isPending}
                >
                  {CATEGORY_DIRECTORY_SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full"
                disabled={!hasActiveFilters || isPending}
                onClick={handleClear}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>
            Showing <span className="font-semibold text-foreground">{filteredCount}</span>{" "}
            of <span className="font-semibold text-foreground">{totalCount}</span>{" "}
            categories
          </p>
          <p>{isPending ? "Updating directory..." : "Directory stays synced with the URL."}</p>
        </div>
      </div>
    </div>
  );
}
