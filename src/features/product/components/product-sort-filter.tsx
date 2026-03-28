"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDownNarrowWide } from "lucide-react";
import { useCallback, useTransition } from "react";

import {
  DEFAULT_PRODUCT_SORT,
  PRODUCT_SORT_OPTIONS,
  normalizeProductSort,
} from "@/features/product/types/product-sort";
import { cn } from "@/lib/utils";

interface ProductSortFilterProps {
  basePath: string;
}

const selectClassName =
  "flex h-10 w-full max-w-[220px] rounded-full border border-input bg-transparent px-4 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function ProductSortFilter({ basePath }: ProductSortFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentSort = normalizeProductSort(
    searchParams.get("sort") ?? DEFAULT_PRODUCT_SORT,
  );

  const handleSortChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>): void => {
      const nextParams = new URLSearchParams(searchParams.toString());

      if (event.target.value === DEFAULT_PRODUCT_SORT) {
        nextParams.delete("sort");
      } else {
        nextParams.set("sort", event.target.value);
      }

      nextParams.delete("page");

      const queryString = nextParams.toString();
      const nextUrl = queryString ? `${basePath}?${queryString}` : basePath;

      startTransition(() => {
        router.replace(nextUrl, { scroll: false });
      });
    },
    [basePath, router, searchParams],
  );

  return (
    <div
      className="flex items-center gap-3"
      aria-busy={isPending}
      data-pending={isPending ? "true" : "false"}
    >
      <ArrowDownNarrowWide className="size-4 text-muted-foreground" />
      <select
        value={currentSort}
        onChange={handleSortChange}
        className={cn(selectClassName)}
        aria-label="Sort products"
        disabled={isPending}
      >
        {PRODUCT_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
